import asyncio
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

from services.engine_connector import fetch_rust_security_evidence
from services.explainer import generate_explanation

logger = logging.getLogger(__name__)
router = APIRouter()

class ScanRequest(BaseModel):
    url: str

async def run_with_timeout(coro, timeout: float, engine_name: str) -> Dict[str, Any]:
    """Wraps an engine call in a strict timeout to ensure the API stays responsive."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(f"Timeout exceeded for engine: {engine_name}")
        return {
            "engine_name": engine_name,
            "coverage": "Timeout exceeded",
            "limitations": [f"{engine_name} failed to respond within {timeout} seconds"],
            "findings": []
        }
    except Exception as e:
        logger.error(f"Execution error in {engine_name}: {str(e)}")
        return {
            "engine_name": engine_name,
            "coverage": "Execution error",
            "limitations": [f"Internal error: {str(e)}"],
            "findings": []
        }

@router.post("/api/v1/scan")
async def run_security_scan(request: ScanRequest):
    """
    Asynchronous fusion pipeline: Dispatches requests to all security engines concurrently,
    enforces timeouts, compiles partial results, and generates a validated explanation.
    """
    # 1. Dispatch engines concurrently
    tasks = [
        run_with_timeout(
            fetch_rust_security_evidence(request.url),
            timeout=10.0,
            engine_name="rust_security_core"
        )
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 2. Compile partial results
    completed_engines = []
    failed_engines = []

    for res in results:
        if isinstance(res, Exception):
            continue

        if "Timeout exceeded" in res.get("coverage", "") or "Execution error" in res.get("coverage", ""):
            failed_engines.append(res)
        else:
            completed_engines.append(res)

    pipeline_status = "complete"
    if failed_engines and not completed_engines:
        pipeline_status = "failed"
    elif failed_engines:
        pipeline_status = "partial"

    # 3. Generate Validated LLM Explanation (Task 2 & 3)
    # We pass only the completed engines to prevent hallucinating on errors
    explanation = await generate_explanation(request.url, completed_engines)

    # 4. Final Fusion Report
    return {
        "target_url": request.url,
        "pipeline_status": pipeline_status,
        "coverage_report": {
            "successful_engines_count": len(completed_engines),
            "failed_engines_count": len(failed_engines),
            "active_engines": [e.get("engine_name") for e in completed_engines],
            "offline_engines": [e.get("engine_name") for e in failed_engines]
        },
        "explanation": explanation,
        "engine_results": completed_engines + failed_engines
    }
