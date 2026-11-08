import os
import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Fetch the URL from the docker-compose environment variables
RUST_ENGINE_URL = os.getenv("SECURITY_ENGINE_URL", "http://rust_security:8001/api/v1/security/analyze")

async def fetch_rust_security_evidence(target_url: str) -> Dict[str, Any]:
    """
    Calls Member 2's Rust Security Engine to get SSRF and TLS Certificate findings.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                RUST_ENGINE_URL,
                params={"url": target_url}
            )
            response.raise_for_status()
            return response.json()

    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Rust engine: {e}")
        return {
            "engine_name": "rust_security_core",
            "coverage": "Failed to reach engine",
            "limitations": [f"Network error connecting to Rust backend: {str(e)}"],
            "findings": []
        }
    except httpx.HTTPStatusError as e:
        logger.error(f"Rust engine returned an error status: {e}")
        return {
            "engine_name": "rust_security_core",
            "coverage": "Engine returned error",
            "limitations": [f"HTTP {e.response.status_code} from Rust backend"],
            "findings": []
        }
