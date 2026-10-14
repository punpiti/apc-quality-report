#!/usr/bin/env python3
"""Fetch OpenAlex journal APC records and analyse APC-quality associations.

Raw API pages are cached outside OneDrive. The compact journal-level extract,
summary tables, and report snapshot are written next to this script.
"""

from __future__ import annotations

import json
import math
import time
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from scipy import stats


API = "https://api.openalex.org/sources"
CACHE_DIR = Path("/var/tmp/openalex-apc-quality-20261014")
OUT_DIR = Path(__file__).resolve().parent
SELECT = ",".join(
    [
        "id",
        "display_name",
        "issn_l",
        "apc_usd",
        "apc_prices",
        "summary_stats",
        "works_count",
        "cited_by_count",
        "is_oa",
        "is_in_doaj",
        "is_core",
        "listed_in",
        "country_code",
        "host_organization_name",
        "first_publication_year",
        "last_publication_year",
        "topics",
        "updated_date",
    ]
)


def fetch_filter(filter_value: str, label: str) -> list[dict]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / f"sources_{label}.jsonl"
    if cache_path.exists() and cache_path.stat().st_size > 0:
        return [json.loads(line) for line in cache_path.read_text().splitlines()]

    rows: list[dict] = []
    cursor = "*"
    session = requests.Session()
    session.headers.update({"User-Agent": "OpenAlex-APC-quality-report/1.0"})
    while cursor:
        params = {
            "filter": filter_value,
            "per-page": 100,
            "cursor": cursor,
            "select": SELECT,
        }
        for attempt in range(6):
            response = session.get(API, params=params, timeout=90)
            if response.status_code == 200:
                break
            if response.status_code in {429, 500, 502, 503, 504}:
                time.sleep(2**attempt)
                continue
            response.raise_for_status()
        response.raise_for_status()
        payload = response.json()
        batch = payload.get("results", [])
        rows.extend(batch)
        cursor = payload.get("meta", {}).get("next_cursor")
        if not batch:
            break
        time.sleep(0.08)

    with cache_path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    return rows


def flatten(record: dict) -> dict:
    summary = record.get("summary_stats") or {}
    topics = record.get("topics") or []
    dominant = topics[0] if topics else {}
    listed = set(record.get("listed_in") or [])
    apc_prices = record.get("apc_prices") or []
    return {
        "openalex_id": record.get("id"),
        "journal": record.get("display_name"),
        "issn_l": record.get("issn_l"),
        "apc_usd": record.get("apc_usd"),
        "apc_price_currencies": ";".join(
            f"{x.get('currency')}:{x.get('price')}" for x in apc_prices
        ),
        "two_year_mean_citedness": summary.get("2yr_mean_citedness"),
        "h_index": summary.get("h_index"),
        "i10_index": summary.get("i10_index"),
        "works_count": record.get("works_count"),
        "cited_by_count": record.get("cited_by_count"),
        "is_oa": bool(record.get("is_oa")),
        "is_in_doaj": bool(record.get("is_in_doaj")),
        "is_core": bool(record.get("is_core")),
        "listed_in": ";".join(sorted(listed)),
        "country_code": record.get("country_code"),
        "publisher": record.get("host_organization_name"),
        "first_publication_year": record.get("first_publication_year"),
        "last_publication_year": record.get("last_publication_year"),
        "dominant_topic": dominant.get("display_name"),
        "dominant_subfield": (dominant.get("subfield") or {}).get("display_name"),
        "dominant_field": (dominant.get("field") or {}).get("display_name"),
        "dominant_domain": (dominant.get("domain") or {}).get("display_name"),
        "topic_work_count": dominant.get("count"),
        "updated_date": record.get("updated_date"),
        "norway_level": 2 if "norway-2" in listed else (1 if "norway-1" in listed else 0),
        "jufo_level": 3 if "jufo-3" in listed else (2 if "jufo-2" in listed else (1 if "jufo-1" in listed else 0)),
        "abdc_level": (
            "A*" if "abdc-a-star" in listed else
            "A" if "abdc-a" in listed else
            "B" if "abdc-b" in listed else
            "C" if "abdc-c" in listed else "Unlisted"
        ),
        "is_medline": "medline" in listed,
        "is_ft50": "ft50" in listed,
        "is_utd24": "utd24" in listed,
    }


def quartiles_desc(series: pd.Series) -> pd.Series:
    result = pd.Series(pd.NA, index=series.index, dtype="Int64")
    valid = series.notna()
    if valid.sum() < 8 or series[valid].nunique() < 4:
        return result
    ranks = series[valid].rank(method="average", ascending=False, pct=True)
    result.loc[valid] = np.ceil(ranks * 4).clip(1, 4).astype(int)
    return result


def spearman_table(df: pd.DataFrame, population: str) -> pd.DataFrame:
    metrics = [
        ("two_year_mean_citedness", "2-year mean citedness"),
        ("h_index", "h-index"),
        ("i10_index", "i10-index"),
        ("cited_by_count", "Lifetime citations"),
        ("works_count", "Works count"),
    ]
    rows = []
    for column, label in metrics:
        pair = df[["apc_usd", column]].dropna()
        rho, p = stats.spearmanr(pair["apc_usd"], pair[column])
        rows.append(
            {
                "population": population,
                "metric": label,
                "n": len(pair),
                "spearman_rho": float(rho),
                "p_value": float(p),
            }
        )
    return pd.DataFrame(rows)


def bootstrap_median_ci(values: pd.Series, seed: int = 20261014) -> tuple[float, float]:
    array = values.dropna().to_numpy(dtype=float)
    if len(array) < 2:
        return (math.nan, math.nan)
    rng = np.random.default_rng(seed + len(array))
    sims = np.median(rng.choice(array, size=(2000, len(array)), replace=True), axis=1)
    return tuple(np.quantile(sims, [0.025, 0.975]))


def grouped_apc(df: pd.DataFrame, group_col: str, label: str) -> pd.DataFrame:
    rows = []
    for value, group in df.groupby(group_col, dropna=False):
        lo, hi = bootstrap_median_ci(group["apc_usd"])
        rows.append(
            {
                "grouping": label,
                "group": str(value),
                "n": len(group),
                "median_apc_usd": float(group["apc_usd"].median()),
                "mean_apc_usd": float(group["apc_usd"].mean()),
                "p25_apc_usd": float(group["apc_usd"].quantile(0.25)),
                "p75_apc_usd": float(group["apc_usd"].quantile(0.75)),
                "median_ci_low": float(lo),
                "median_ci_high": float(hi),
            }
        )
    return pd.DataFrame(rows)


def adjusted_model(df: pd.DataFrame) -> dict:
    """OLS on log APC with HC1 robust SE; descriptive, not causal."""
    model = df[df["apc_usd"] > 0].copy()
    fields = model["dominant_field"].fillna("Unknown")
    keep_fields = fields.value_counts()[lambda s: s >= 100].index
    fields = fields.where(fields.isin(keep_fields), "Other/Unknown")
    numeric = pd.DataFrame(
        {
            "log_h_index": np.log1p(model["h_index"]),
            "log_two_year": np.log1p(model["two_year_mean_citedness"].clip(lower=0)),
            "log_works": np.log1p(model["works_count"]),
            "is_oa": model["is_oa"].astype(float),
            "is_in_doaj": model["is_in_doaj"].astype(float),
            "is_core": model["is_core"].astype(float),
        },
        index=model.index,
    )
    complete = numeric.notna().all(axis=1) & model["apc_usd"].notna()
    model = model.loc[complete]
    numeric = numeric.loc[complete]
    fields = fields.loc[complete]
    continuous = ["log_h_index", "log_two_year", "log_works"]
    means = numeric[continuous].mean()
    sds = numeric[continuous].std(ddof=0).replace(0, 1)
    numeric[continuous] = (numeric[continuous] - means) / sds
    dummies = pd.get_dummies(fields, prefix="field", drop_first=True, dtype=float)
    xdf = pd.concat([numeric, dummies], axis=1)
    X = np.column_stack([np.ones(len(xdf)), xdf.to_numpy(dtype=float)])
    y = np.log(model["apc_usd"].to_numpy(dtype=float))
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    residuals = y - X @ beta
    n, k = X.shape
    bread = np.linalg.pinv(X.T @ X)
    meat = X.T @ ((residuals**2)[:, None] * X)
    cov_hc1 = (n / (n - k)) * bread @ meat @ bread
    se = np.sqrt(np.diag(cov_hc1))
    names = ["intercept"] + list(xdf.columns)
    rows = []
    for name, coef, stderr in zip(names, beta, se):
        if name == "intercept" or name.startswith("field_"):
            continue
        rows.append(
            {
                "term": name,
                "coefficient_log_apc": float(coef),
                "robust_se": float(stderr),
                "percent_difference": float((math.exp(coef) - 1) * 100),
                "ci95_low_percent": float((math.exp(coef - 1.96 * stderr) - 1) * 100),
                "ci95_high_percent": float((math.exp(coef + 1.96 * stderr) - 1) * 100),
            }
        )
    return {"n": n, "k": k, "rows": rows, "field_reference": sorted(fields.unique())[0]}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    positive = fetch_filter("type:journal,apc_usd:>0", "positive")
    zero = fetch_filter("type:journal,apc_usd:0", "zero")
    records = positive + zero
    df = pd.DataFrame(flatten(row) for row in records)
    df = df.drop_duplicates(subset=["openalex_id"]).copy()
    numeric_cols = [
        "apc_usd", "two_year_mean_citedness", "h_index", "i10_index",
        "works_count", "cited_by_count", "first_publication_year",
        "last_publication_year", "topic_work_count",
    ]
    for column in numeric_cols:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    df["citations_per_work_lifetime"] = df["cited_by_count"] / df["works_count"].replace(0, np.nan)
    df["openalex_q_global"] = quartiles_desc(df["two_year_mean_citedness"])
    df["openalex_q_field"] = (
        df.groupby(df["dominant_field"].fillna("Unknown"), group_keys=False)["two_year_mean_citedness"]
        .apply(quartiles_desc)
        .astype("Int64")
    )

    df = df.sort_values(["apc_usd", "journal"], ascending=[False, True])
    df.to_csv(OUT_DIR / "openalex_journals_with_known_apc.csv", index=False)

    correlations = pd.concat(
        [
            spearman_table(df, "All known APC values (including USD 0)"),
            spearman_table(df[df["apc_usd"] > 0], "Positive APC only"),
        ],
        ignore_index=True,
    )
    correlations.to_csv(OUT_DIR / "correlations.csv", index=False)

    quartile = grouped_apc(df.dropna(subset=["openalex_q_field"]), "openalex_q_field", "OpenAlex field-adjusted quartile")
    quartile["group"] = "Q" + quartile["group"].str.replace("<NA>", "")
    quartile.to_csv(OUT_DIR / "apc_by_openalex_quartile.csv", index=False)

    curated = pd.concat(
        [
            grouped_apc(df, "is_core", "CWTS Core"),
            grouped_apc(df, "is_in_doaj", "DOAJ"),
            grouped_apc(df, "is_medline", "MEDLINE"),
            grouped_apc(df[df["norway_level"] > 0], "norway_level", "Norwegian Register level"),
            grouped_apc(df[df["jufo_level"] > 0], "jufo_level", "JUFO level"),
            grouped_apc(df[df["abdc_level"] != "Unlisted"], "abdc_level", "ABDC rating"),
        ],
        ignore_index=True,
    )
    curated.to_csv(OUT_DIR / "apc_by_curated_list.csv", index=False)

    field_corr_rows = []
    for field, group in df.groupby("dominant_field", dropna=True):
        pair = group[["apc_usd", "two_year_mean_citedness"]].dropna()
        if len(pair) < 50:
            continue
        rho, p = stats.spearmanr(pair["apc_usd"], pair["two_year_mean_citedness"])
        field_corr_rows.append(
            {"field": field, "n": len(pair), "spearman_rho": float(rho), "p_value": float(p)}
        )
    pd.DataFrame(field_corr_rows).sort_values("spearman_rho", ascending=False).to_csv(
        OUT_DIR / "field_correlations_apc_vs_two_year_citedness.csv", index=False
    )

    model = adjusted_model(df)
    (OUT_DIR / "adjusted_model.json").write_text(
        json.dumps(model, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    max_updated = pd.to_datetime(df["updated_date"], errors="coerce", utc=True).max()
    summary = {
        "generated_at": pd.Timestamp.now(tz="UTC").isoformat(),
        "openalex_max_updated_at": max_updated.isoformat() if pd.notna(max_updated) else None,
        "n_journals": int(len(df)),
        "n_zero_apc": int((df["apc_usd"] == 0).sum()),
        "n_positive_apc": int((df["apc_usd"] > 0).sum()),
        "n_with_two_year_mean_citedness": int(df["two_year_mean_citedness"].notna().sum()),
        "n_with_h_index": int(df["h_index"].notna().sum()),
        "apc_usd": {
            "median_all": float(df["apc_usd"].median()),
            "median_positive": float(df.loc[df["apc_usd"] > 0, "apc_usd"].median()),
            "p25": float(df["apc_usd"].quantile(0.25)),
            "p75": float(df["apc_usd"].quantile(0.75)),
            "p95": float(df["apc_usd"].quantile(0.95)),
            "max": float(df["apc_usd"].max()),
        },
        "duplicate_openalex_ids_removed": int(len(records) - len(df)),
        "adjusted_model": model,
    }
    (OUT_DIR / "analysis_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    api_positive = (
        "https://api.openalex.org/sources?"
        "filter=type%3Ajournal%2Capc_usd%3A%3E0&per-page=100&cursor=*"
    )
    api_zero = (
        "https://api.openalex.org/sources?"
        "filter=type%3Ajournal%2Capc_usd%3A0&per-page=100&cursor=*"
    )
    component_ids = [
        "apc-executive-summary", "apc-key-metrics", "apc-correlation-chart",
        "apc-quartile-chart", "apc-list-chart", "apc-field-chart",
        "apc-interpretation", "apc-methods-limitations",
    ]

    def source_meta(label: str, definitions: list[dict], note: str) -> dict:
        return {
            "label": label,
            "urls": [api_positive, api_zero],
            "executedAt": summary["generated_at"],
            "freshness": f"Source records updated through {summary['openalex_max_updated_at']}",
            "metricDefinitions": definitions,
            "evidenceFlow": [
                {
                    "title": "OpenAlex Sources API",
                    "detail": (
                        "Cursor-paged every source with type=journal and a recorded APC in USD, "
                        "including USD 0 and positive values. Selected journal identity, APC, "
                        "summary citation statistics, source-list membership, OA flags, and topics."
                    ),
                },
                {
                    "title": "Analysis",
                    "detail": note,
                },
            ],
            "caveats": [
                "APC is the current advertised list price converted to USD, not the amount an author paid.",
                "OpenAlex APC coverage is selective and is thinner for hybrid journals.",
                "Associations are descriptive and do not identify a causal effect of price on quality.",
                "OpenAlex-derived quartiles are not Scopus/SCImago or Journal Citation Reports quartiles.",
            ],
        }

    common_defs = [
        {
            "field": "apc_usd",
            "label": "APC list price (USD)",
            "definition": "Current advertised journal APC converted to USD by OpenAlex; zero denotes a recorded no-fee price.",
            "componentIds": component_ids,
            "sourceLineage": [{"urls": [api_positive, api_zero]}],
        },
        {
            "field": "two_year_mean_citedness",
            "label": "2-year mean citedness",
            "definition": "OpenAlex citation-impact convenience metric using citations in the prior year to works from the two years before that.",
            "componentIds": component_ids,
            "sourceLineage": [{"urls": [api_positive, api_zero]}],
        },
        {
            "field": "h_index",
            "label": "h-index",
            "definition": "Largest h such that at least h works from the journal have at least h citations in OpenAlex.",
            "componentIds": component_ids,
            "sourceLineage": [{"urls": [api_positive, api_zero]}],
        },
        {
            "field": "openalex_q_field",
            "label": "OpenAlex field-adjusted quartile",
            "definition": "Quartile of 2-year mean citedness within the journal's dominant OpenAlex field; Q1 is the top 25%.",
            "formula": "descending percentile rank of two_year_mean_citedness within dominant_field",
            "componentIds": ["apc-quartile-chart", "apc-interpretation", "apc-methods-limitations"],
            "sourceLineage": [{"urls": [api_positive, api_zero]}],
        },
    ]
    corr_rows = correlations.round({"spearman_rho": 4, "p_value": 8}).to_dict("records")
    quartile_rows = quartile.round(2).to_dict("records")
    curated_rows = curated.round(2).to_dict("records")
    field_rows = pd.read_csv(OUT_DIR / "field_correlations_apc_vs_two_year_citedness.csv")
    field_rows = field_rows.round({"spearman_rho": 4, "p_value": 8}).to_dict("records")
    model_rows = [{"n": model["n"], **row} for row in model["rows"]]
    coverage_rows = [
        {"population": "All OpenAlex journal sources", "n": 217114},
        {"population": "Active in 2025 or 2026", "n": 88583},
        {"population": "Active with known positive APC", "n": 13467},
        {"population": "Active with recorded USD 0 APC", "n": 607},
    ]
    snapshot = {
        "id": "openalex-apc-quality-2026-10-14",
        "title": "APC สูงสัมพันธ์กับตัวชี้วัดการอ้างอิง แต่ราคาไม่ใช่คะแนนคุณภาพ",
        "surface": "report",
        "status": "observed",
        "buildStatus": "creating",
        "generatedAt": summary["generated_at"],
        "filters": [],
        "report": {
            "asOf": "2026-10-14",
            "originalQuestion": "ความสัมพันธ์ระหว่าง APC กับ Q, h-index และตัวชี้วัดคุณภาพวารสารอื่นใน OpenAlex เป็นอย่างไร",
        },
        "queries": {
            "overview": {
                "label": "Population and headline statistics",
                "rows": [{
                    "journals": summary["n_journals"],
                    "zero_apc_journals": summary["n_zero_apc"],
                    "positive_apc_journals": summary["n_positive_apc"],
                    "median_apc_usd": summary["apc_usd"]["median_all"],
                    "median_positive_apc_usd": summary["apc_usd"]["median_positive"],
                    "apc_p25_usd": summary["apc_usd"]["p25"],
                    "apc_p75_usd": summary["apc_usd"]["p75"],
                    "apc_max_usd": summary["apc_usd"]["max"],
                }],
                "source": source_meta(
                    "OpenAlex Sources API: journals with recorded APC",
                    common_defs,
                    "Deduplicated on OpenAlex source ID; no duplicates were removed. Descriptive statistics use all recorded APC values.",
                ),
            },
            "correlations": {
                "label": "Spearman associations between APC and journal metrics",
                "rows": corr_rows,
                "source": source_meta(
                    "OpenAlex APC and summary statistics",
                    common_defs,
                    "Pairwise Spearman rank correlations, reported for all recorded APC values and for positive APC values only.",
                ),
            },
            "quartiles": {
                "label": "APC by OpenAlex field-adjusted citedness quartile",
                "rows": quartile_rows,
                "source": source_meta(
                    "OpenAlex-derived field quartiles",
                    common_defs,
                    "Assigned Q1-Q4 within dominant OpenAlex field using 2-year mean citedness; medians include 2,000 bootstrap draws for 95% intervals.",
                ),
            },
            "curated_lists": {
                "label": "APC by curated source-list membership or level",
                "rows": curated_rows,
                "source": source_meta(
                    "OpenAlex source-list memberships",
                    common_defs,
                    "Grouped recorded APC values by CWTS Core, DOAJ, MEDLINE, Norwegian Register, JUFO, and ABDC memberships loaded by OpenAlex.",
                ),
            },
            "field_correlations": {
                "label": "APC versus 2-year mean citedness within fields",
                "rows": field_rows,
                "source": source_meta(
                    "OpenAlex APC, topics, and 2-year mean citedness",
                    common_defs,
                    "Calculated Spearman correlations separately for dominant fields with at least 50 journals in the APC-known population.",
                ),
            },
            "adjusted_model": {
                "label": "Descriptive multivariable sensitivity model",
                "rows": model_rows,
                "source": source_meta(
                    "OpenAlex descriptive sensitivity model",
                    common_defs,
                    "OLS of log positive APC on standardized log h-index, standardized log 2-year citedness, standardized log works count, OA/DOAJ/Core flags, and dominant-field fixed effects; HC1 robust standard errors.",
                ),
            },
            "coverage": {
                "label": "OpenAlex APC coverage",
                "rows": coverage_rows,
                "source": source_meta(
                    "OpenAlex Sources API counts",
                    common_defs,
                    "Counts were read from API metadata on 2026-10-14 using journal type, last-publication-year, and APC filters.",
                ),
            },
        },
    }
    (OUT_DIR / "report_snapshot.json").write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
