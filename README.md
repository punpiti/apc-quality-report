# APC quality report

An English-language report with a Thai translation examining the relationship between advertised article processing charges (APCs), citation measures, publication volume, OpenAlex-derived quartiles, and the Norway, JUFO, and ABDC journal lists.

GitHub Pages: https://punpiti.github.io/apc-quality-report/

Urban mirror: https://urban.cpe.ku.ac.th/apc-quality-report.html

The analysis includes 15,176 journals, retrieved on 14 October 2026. The report opens in English; choose **ไทย** to read the Thai translation. The field selector has been removed. A static chart retains the comparison across fields. The glossary explains Q, Top 10% / Tier 1, TCI, citation measures, journal lists, and statistical terms.

## Files

- `src/content/report/`: React report, English narrative, Thai translation, and CSS
- `src/theme.css`: report theme
- `data/report_snapshot.json`: reviewed data and provenance for the current report
- `data/*.csv`: journal extract and analytical results
- `analysis/fetch_analyze_openalex.py`: data retrieval and analysis
- `site/index.html`: complete report served at the GitHub Pages project URL
- `site/apc-quality-report.html`: identical report served at the named Urban URL
- `scripts/`: local report build and Google Analytics integration
- `.github/workflows/pages.yml`: deploys the prebuilt `site/` directory
- `CITATION.cff` and `CITATION.md`: citation metadata prepared for a future DOI
- `DEPLOYMENT.md`: deployment and update instructions

## Build

The local build requires Node.js and version 1.0.11 of the Codex Data Analytics plugin, which supplies the report runtime and charts. Build files are generated in a temporary directory outside the repository to keep caches out of OneDrive.

```bash
node scripts/build-report.mjs
```

Set `DATA_ANALYTICS_PLUGIN_ROOT` if the plugin is installed elsewhere. It must point to the directory containing `scripts/data-app.mjs` and `scripts/prepare-data-app.mjs`.

The build writes `site/apc-quality-report.html` and `site/index.html`, retaining Google Analytics measurement ID `G-BWX7PFH4XM`, the same ID used by the Urban homepage. A local build does not update the Urban server.

The GitHub Pages workflow publishes the reviewed HTML committed to `site/`. It does not need the Codex plugin or install dependencies on the Actions runner. Enable **Settings → Pages → Source: GitHub Actions** for the repository. A push to `main` that changes `site/` then deploys the new report.

## Re-run analysis

Use a machine-local Python environment with the dependencies in `analysis/requirements.txt`. Keep environments outside OneDrive.

```bash
python analysis/fetch_analyze_openalex.py
```

New analysis outputs are written to `analysis/`. Raw API pages are cached at `/var/tmp/openalex-apc-quality-20261014`; the script reuses existing cache files. Review the cache before changing the data cutoff or refreshing the evidence.

After rerunning the analysis, review the numbers, narrative, and evidence dates before updating `data/report_snapshot.json` and rebuilding the website. Recalculated results do not automatically update the report text.

## Interpretation

The results are journal-level associations and do not establish the causes of APC prices. The quartiles are calculated within OpenAlex fields and do not replace Scopus/JCR quartiles or Tier 1 funding classifications. APCs are advertised prices, which may differ from amounts actually paid.

The repository contains authored report source, analysis, data, and the complete published HTML. Rebuilding the HTML uses the runtime from the locally installed plugin.

## Citation and DOI

Citation metadata is supplied in `CITATION.cff`. No DOI is assigned by this repository or by GitHub Pages. Add the actual DOI after archiving a selected version with an archival service, and retain its commit identifier for reproducibility.
