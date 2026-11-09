import socket
import logging
from urllib.parse import urlparse
from typing import List, Dict, Any, Tuple
import httpx

from services.ssrf_guard import validate_url_safety

logger = logging.getLogger(__name__)


def get_base_domain(hostname: str) -> str:
    """Returns the effective base domain stripped of www. and common subdomains."""
    host = hostname.strip().lower().rstrip(".")
    if host.startswith("www."):
        host = host[4:]
    parts = host.split(".")
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host


def resolve_dns_signals(hostname: str) -> Dict[str, Any]:
    """
    Safely resolves DNS records and checks domain characteristics (Handbook Module 1).
    """
    cleaned_host = hostname.strip().lower().rstrip(".")
    signals: List[Dict[str, Any]] = []
    resolved_ips: List[str] = []

    try:
        addr_info = socket.getaddrinfo(cleaned_host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        for entry in addr_info:
            ip = entry[4][0]
            if ip not in resolved_ips:
                resolved_ips.append(ip)
    except socket.gaierror as e:
        logger.debug(f"DNS resolution error for {cleaned_host}: {e}")
        signals.append({
            "id": "SEC-DNS-UNRESOLVABLE",
            "signal": "Unresolvable Domain Name",
            "severity": "medium",
            "explanation": f"Domain {cleaned_host} did not resolve to a public IP address.",
            "source": "dns_resolver"
        })
        return {
            "resolved_ips": [],
            "dns_signals": signals,
            "ip_count": 0
        }

    # Fast-flux or multiple IP anomaly
    if len(resolved_ips) >= 4:
        signals.append({
            "id": "SEC-DNS-MULTI-IP",
            "signal": "High IP Diversity / Potential Fast-Flux",
            "severity": "low",
            "explanation": f"Domain resolves to {len(resolved_ips)} distinct IP addresses across multiple subnets.",
            "source": "dns_resolver"
        })

    return {
        "resolved_ips": resolved_ips,
        "dns_signals": signals,
        "ip_count": len(resolved_ips)
    }


def trace_redirect_chain(start_url: str, max_hops: int = 5) -> Tuple[List[Dict[str, Any]], str, List[Dict[str, Any]]]:
    """
    Traces HTTP redirect chain while validating EVERY intermediate hop against SSRF policies.
    Distinguishes between harmless canonical redirects (e.g. domain.com -> www.domain.com)
    and true cross-domain redirects to unrelated domains.
    """
    current_url = start_url
    hops: List[Dict[str, Any]] = []
    evidence: List[Dict[str, Any]] = []

    parsed_start = urlparse(start_url)
    start_host = (parsed_start.hostname or "").lower()
    start_base = get_base_domain(start_host)

    try:
        for hop_index in range(max_hops):
            safe_hop_url = validate_url_safety(current_url)

            with httpx.Client(timeout=4.0, follow_redirects=False, verify=False) as client:
                res = client.head(safe_hop_url, headers={"User-Agent": "TrustLens-Security-Bot/1.0"})
                status = res.status_code

                hops.append({
                    "hop": hop_index + 1,
                    "url": current_url,
                    "status_code": status
                })

                if status in (301, 302, 303, 307, 308):
                    location = res.headers.get("Location")
                    if not location:
                        break

                    if location.startswith("/"):
                        p = urlparse(current_url)
                        location = f"{p.scheme}://{p.netloc}{location}"

                    hop_host = (urlparse(location).hostname or "").lower()
                    hop_base = get_base_domain(hop_host)

                    # Only flag if the base registered domain is truly different
                    if hop_host and hop_base != start_base:
                        evidence.append({
                            "id": f"SEC-REDIR-CROSS-DOMAIN-{hop_index+1}",
                            "signal": "Cross-Domain Redirect Detected",
                            "severity": "medium",
                            "explanation": f"Initial target ({start_host}) redirected to an unrelated external domain ({hop_host}).",
                            "source": "redirect_tracer"
                        })

                    current_url = location
                else:
                    break

        if len(hops) >= max_hops:
            evidence.append({
                "id": "SEC-REDIR-LOOP",
                "signal": "Excessive Redirect Chain",
                "severity": "high",
                "explanation": f"Target exceeded maximum redirect limit ({max_hops} hops). Potential redirect loop or cloaking.",
                "source": "redirect_tracer"
            })

    except Exception as e:
        logger.debug(f"Redirect trace stopped for {start_url}: {e}")

    return hops, current_url, evidence
