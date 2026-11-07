
from urllib.parse import urlparse

from .domain_database import get_connection


# Extract domain from URL
def extract_domain(url):

    if "://" not in url:
        url = "https://" + url

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("Invalid website URL")

    return parsed.hostname.lower().rstrip(".")


# Search domain in threat database
def check_domain(url):

    domain = extract_domain(url)

    connection = get_connection()

    result = connection.execute("""
        SELECT * FROM threat_domains
        WHERE domain = ?
    """, (domain,)).fetchone()

    connection.close()

    if result:

        return {
            "domain": domain,
            "found": True,
            "threat_type": result["threat_type"],
            "confidence": result["confidence"],
            "source": result["source"]
        }

    return {
        "domain": domain,
        "found": False,
        "message": "Domain not found in threat intelligence database"
    }
