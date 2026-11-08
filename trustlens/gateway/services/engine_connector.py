import os
import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Fetch service URLs from environment variables with fallbacks
RUST_ENGINE_URL = os.getenv(
    "SECURITY_ENGINE_URL",
    "http://rust_security:8001/api/v1/security/analyze"
)
RENDER_ML_URL = os.getenv(
    "RENDER_ML_URL",
    "https://hackmatrix-adamas.onrender.com/predict"
)


async def fetch_rust_security_evidence(target_url: str) -> Dict[str, Any]:
    """
    Calls Member 2's Rust Security Engine to get SSRF and TLS Certificate findings via GET.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                RUST_ENGINE_URL,
                params={"url": target_url}
            )
            response.raise_for_status()

            # Safely parse JSON payload
            return response.json()

    except httpx.HTTPStatusError as e:
        logger.error(f"Rust engine returned an error status: {e}")
        return {
            "engine_name": "rust_security_core",
            "coverage": "Engine returned error",
            "limitations": [f"HTTP {e.response.status_code} from Rust backend"],
            "findings": []
        }
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Rust engine: {e}")
        return {
            "engine_name": "rust_security_core",
            "coverage": "Failed to reach engine",
            "limitations": [f"Network error connecting to Rust backend: {str(e)}"],
            "findings": []
        }
    except ValueError as e:
        logger.error(f"Failed to decode JSON from Rust engine: {e}")
        return {
            "engine_name": "rust_security_core",
            "coverage": "Invalid JSON response",
            "limitations": ["Rust backend returned non-JSON response body"],
            "findings": []
        }


async def fetch_ml_phishing_prediction(target_url: str) -> Dict[str, Any]:
    """
    Calls Member 1's XGBoost + SHAP Phishing Model hosted on Render via POST.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                RENDER_ML_URL,
                json={"url": target_url}
            )
            response.raise_for_status()

            data = response.json()
            return {
                "engine_name": "ml_phishing_engine",
                "coverage": "Analysis completed",
                "limitations": [],
                "findings": [],
                "raw_data": data
            }

    except httpx.HTTPStatusError as e:
        logger.error(f"Render ML engine returned an error status: {e}")
        return {
            "engine_name": "ml_phishing_engine",
            "coverage": "ML engine returned error",
            "limitations": [f"HTTP {e.response.status_code} from Render ML service"],
            "findings": []
        }
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Render ML engine: {e}")
        return {
            "engine_name": "ml_phishing_engine",
            "coverage": "Failed to reach Render ML engine",
            "limitations": [f"Network error connecting to Render backend: {str(e)}"],
            "findings": []
        }
    except ValueError as e:
        logger.error(f"Failed to decode JSON from Render ML engine: {e}")
        return {
            "engine_name": "ml_phishing_engine",
            "coverage": "Invalid JSON response",
            "limitations": ["Render ML service returned non-JSON response body"],
            "findings": []
        }
