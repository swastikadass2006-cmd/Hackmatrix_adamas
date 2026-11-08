import httpx
import logging

logger = logging.getLogger(__name__)

# Live Cloudflare Tunnel URL running on Colab GPU
COLAB_ML_URL = "https://nursery-battle-identify-assign.trycloudflare.com/api/v1/ml/analyze"

async def call_phishing_engine(target_url: str) -> dict:
    """
    Routes phishing ML requests to the remote Colab GPU tunnel.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(COLAB_ML_URL, params={"url": target_url})
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Cloud ML engine error: {response.status_code}")
                return {"phishing_score": 0, "status": "ML Engine Error"}
        except Exception as e:
            logger.error(f"Failed to reach Cloud ML engine: {str(e)}")
            return {"phishing_score": 0, "status": "ML Engine Unreachable"}
