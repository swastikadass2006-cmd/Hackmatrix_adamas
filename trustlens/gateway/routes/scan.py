import os
import httpx
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# 1. Properly initialize your endpoints at the top of the file
RENDER_ML_URL = os.getenv("RENDER_ML_URL", "https://hackmatrix-adamas.onrender.com/predict")
SECURITY_ENGINE_URL = os.getenv("SECURITY_ENGINE_URL", "http://rust_security:8001/api/v1/security/analyze")

class ScanRequest(BaseModel):
    url: str

async def fetch_rust_security(client: httpx.AsyncClient, url: str):
    try:
        # Rust engine requires GET request with URL as a query parameter
        # Increased timeout to 20.0s to accommodate heavy TLS and CT log lookups
        res = await client.get(SECURITY_ENGINE_URL, params={"url": url}, timeout=20.0)
        if res.status_code == 200:
            return "rust_security_core", res.json()

        # Handle non-200 HTTP responses gracefully
        error_msg = res.text if res.text.strip() else f"HTTP {res.status_code}"
        return "rust_security_core", {
            "error": error_msg,
            "coverage": "Rust engine non-200 status",
            "limitations": [f"Rust backend returned: {error_msg}"],
            "findings": []
        }
    except Exception as e:
        # Prevent empty error strings for ReadTimeout exceptions
        err_str = str(e) if str(e).strip() else type(e).__name__
        return "rust_security_core", {
            "error": err_str,
            "coverage": "Timeout or connection error",
            "limitations": [f"rust_security_core failed: {err_str}"],
            "findings": []
        }

async def fetch_ml_phishing(client: httpx.AsyncClient, url: str):
    try:
        # Render ML engine requires POST request with JSON body
        # 20.0s timeout to account for Render cold starts or network latency
        res = await client.post(RENDER_ML_URL, json={"url": url}, timeout=20.0)
        if res.status_code == 200:
            return "ml_phishing_engine", res.json()

        error_msg = res.text if res.text.strip() else f"HTTP {res.status_code}"
        return "ml_phishing_engine", {
            "error": error_msg,
            "coverage": "Render ML non-200 status",
            "limitations": [f"ML backend returned: {error_msg}"],
            "findings": []
        }
    except Exception as e:
        err_str = str(e) if str(e).strip() else type(e).__name__
        return "ml_phishing_engine", {
            "error": err_str,
            "coverage": "Render ML connection error",
            "limitations": [f"ml_phishing_engine failed: {err_str}"],
            "findings": []
        }

# 2. Support both endpoint paths for frontend compatibility
@router.post("/scan")
@router.post("/api/v1/scan")
async def scan_url(request: ScanRequest):
    # 3. Use a single async client for concurrent, lightning-fast execution
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            fetch_rust_security(client, request.url),
            fetch_ml_phishing(client, request.url),
            return_exceptions=True
        )

    engine_results = []
    active_engines = []
    offline_engines = []

    # 4. Process and unify the results
    for item in results:
        if isinstance(item, Exception):
            continue

        name, res = item

        # Determine if the engine failed based on the presence of our custom error injection
        if "error" in res and not res.get("findings") and "prediction" not in res:
            offline_engines.append(name)
        else:
            active_engines.append(name)

        engine_results.append({
            "engine_name": name,
            "coverage": res.get("coverage", "Analysis completed"),
            "limitations": res.get("limitations", []),
            "findings": res.get("findings", []),
            "raw_data": res
        })

    # Determine overall pipeline status dynamically
    if len(active_engines) == 2:
        pipeline_status = "complete"
    elif len(active_engines) == 1:
        pipeline_status = "partial_failure"
    else:
        pipeline_status = "failed"

    return {
        "target_url": request.url,
        "pipeline_status": pipeline_status,
        "coverage_report": {
            "successful_engines_count": len(active_engines),
            "failed_engines_count": len(offline_engines),
            "active_engines": active_engines,
            "offline_engines": offline_engines
        },
        "engine_results": engine_results
    }
