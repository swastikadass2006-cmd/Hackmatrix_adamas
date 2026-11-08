import os
import httpx
import logging

logger = logging.getLogger(__name__)

# Target microservice URLs
COLAB_ML_URL = os.getenv(
    "COLAB_ML_URL",
    "https://nursery-battle-identify-assign.trycloudflare.com/api/v1/ml/analyze"
)
SECURITY_ENGINE_URL = os.getenv(
    "SECURITY_ENGINE_URL",
    "http://rust_security:8001/api/v1/security/analyze"
)

def analyze_security_sync(url: str) -> dict:
    """
    Synchronous Security Analysis Entrypoint called by routes/scan.py.
    Aggregates telemetry from Member 2 (Rust) and Member 1 (Cloud ML).
    """
    aggregated_response = {
        "url": url,
        "overall_trust_score": 100,
        "ml_analysis": {},
        "rust_security": {},
        "status": "success"
    }

    # 1. Fetch Rust Engine Telemetry (Port 8001)
    try:
        with httpx.Client(timeout=10.0) as client:
            rust_res = client.get(SECURITY_ENGINE_URL, params={"url": url})
            if rust_res.status_code == 200:
                aggregated_response["rust_security"] = rust_res.json()
            else:
                aggregated_response["rust_security"] = {"status_code": rust_res.status_code}
    except Exception as e:
        logger.error(f"Failed to connect to Rust Engine: {e}")
        aggregated_response["rust_security"] = {"error": str(e), "engine_name": "Rust Offline"}

    # 2. Fetch Colab ML Inference (Cloudflare Tunnel)
    try:
        with httpx.Client(timeout=15.0) as client:
            ml_res = client.get(COLAB_ML_URL, params={"url": url})
            if ml_res.status_code == 200:
                aggregated_response["ml_analysis"] = ml_res.json()
            else:
                aggregated_response["ml_analysis"] = {"status_code": ml_res.status_code}
    except Exception as e:
        logger.error(f"Failed to connect to Colab ML Engine: {e}")
        aggregated_response["ml_analysis"] = {"error": str(e), "phishing_score": 0}

    return aggregated_response
