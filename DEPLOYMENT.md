# Deployment

Public URL: https://urban.cpe.ku.ac.th/apc-quality-report.html

Google Analytics measurement ID: `G-BWX7PFH4XM`.

## Updating the report file

1. Run `node scripts/build-report.mjs` and review the resulting HTML locally.
2. Upload `site/apc-quality-report.html` to a temporary file next to the live report file in the server's existing shared APC report directory.
3. Back up the live report, then rename the uploaded file atomically to `apc-quality-report.html`.
4. Compare the public response with the local file by SHA-256, and check the field selector in a browser.

Updating the HTML requires no service restart. Keep the existing report at `/reports/apc/` and other report files intact.

## Urban application route

The existing Urban FastAPI application has this exact GET/HEAD route. Preserve it when deploying a future release of that application. `APC_REPORT_STATIC_DIR` is the existing shared APC report directory.

```python
from fastapi.responses import FileResponse


@app.api_route("/apc-quality-report.html", methods=["GET", "HEAD"], include_in_schema=False)
async def apc_quality_report() -> FileResponse:
    report_path = APC_REPORT_STATIC_DIR / "apc-quality-report.html"
    if not report_path.is_file():
        raise HTTPException(status_code=404, detail="APC quality report is not available")
    return FileResponse(
        report_path,
        media_type="text/html",
        headers={"Cache-Control": "no-cache"},
    )
```

Exact server paths and the original route-file backup are recorded in the local workspace deployment log outside this repository. No server credentials or application environment files are required in the repository.

## Verified deployment on 2026-10-14

- Live HTML matched the uploaded package by SHA-256.
- Google tag script returned HTTP 200; Google Analytics `/g/collect` returned HTTP 204.
- Selecting Medicine changed the summary to 3,131 journals and correlation 0.40.
- No JavaScript exceptions in that browser check.
- Ten existing entry pages returned HTTP 200 before and after deployment, with identical response sizes: `/`, `/about`, `/reports/apc/`, `/ai-for-research/`, `/mdri/`, `/ai-integrated-engineering/`, `/madlab/`, `/image_processing/demos/`, `/machine_learning/demos/`, and `/fluid_mechanics/demos/`.

These checks cover those entry pages and the report interactions tested, not every function of each application.
