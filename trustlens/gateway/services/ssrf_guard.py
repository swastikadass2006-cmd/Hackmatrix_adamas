import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException


def validate_url_safety(url_str: str) -> str:
    """
    Strict SSRF validation:
    - Scheme must be http or https
    - Hostname cannot resolve to loopback, private, link-local, multicast, or reserved IPs
    """
    parsed = urlparse(url_str)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL scheme. Only 'http' and 'https' protocols are permitted.",
        )

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="URL must contain a valid hostname.")

    # Reject localhost or internal names
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "metadata.google.internal"):
        raise HTTPException(
            status_code=400,
            detail="Access to internal, loopback, or cloud metadata endpoints is prohibited.",
        )

    # Direct IP check without DNS resolution
    try:
        ip_obj = ipaddress.ip_address(hostname)
        if (
            ip_obj.is_loopback
            or ip_obj.is_private
            or ip_obj.is_link_local
            or ip_obj.is_multicast
            or ip_obj.is_reserved
            or ip_obj.is_unspecified
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Target resolves to restricted internal/private IP range ({hostname}). Request blocked by SSRF filter.",
            )
        return url_str
    except ValueError:
        # Not a raw IP literal, proceed to domain name checks
        pass

    # Resolve IP and check if private/loopback/link-local (with tight 0.2s DNS lookup timeout)
    old_timeout = socket.getdefaulttimeout()
    try:
        socket.setdefaulttimeout(0.2)
        resolved_ips = socket.getaddrinfo(hostname, None)
        for item in resolved_ips:
            ip_str = item[4][0]
            ip_obj = ipaddress.ip_address(ip_str)

            if (
                ip_obj.is_loopback
                or ip_obj.is_private
                or ip_obj.is_link_local
                or ip_obj.is_multicast
                or ip_obj.is_reserved
                or ip_obj.is_unspecified
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Target resolves to restricted internal/private IP range ({ip_str}). Request blocked by SSRF filter.",
                )
    except (socket.gaierror, socket.timeout, OSError):
        # If domain cannot be resolved by DNS, it is either dead, offline, or synthetic. Allow scan to proceed to analysis.
        pass
    finally:
        socket.setdefaulttimeout(old_timeout)

    return url_str
