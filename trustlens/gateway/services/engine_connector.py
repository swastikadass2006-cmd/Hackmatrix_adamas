import os
import httpx

SECURITY_ENGINE_URL = os.getenv(
    "SECURITY_ENGINE_URL",
    "http://localhost:8001"
)


async def analyze_security(url):

    endpoint = (
        f"{SECURITY_ENGINE_URL}/api/v1/security/analyze"
    )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:

            response = await client.get(
                endpoint,
                params={"url": url}
            )

            response.raise_for_status()

            return response.json()

    except httpx.RequestError:
        return {
            "error": "Security engine is unavailable"
        }

    except httpx.HTTPStatusError:
        return {
            "error": "Security engine returned an unsuccessful response"
        }