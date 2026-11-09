import ipaddress
import socket
import re
from urllib.parse import urlparse
from fastapi import HTTPException


def sanitize_url(url_str: str) -> str:
    """
    Sanitizes URL inputs:
    - Strips leading/trailing whitespace
    - Strips accidental surrounding quotes (', ", `)
    - Auto-prepends 'https://' if scheme is missing
    """
    if not url_str:
        return ""

    cleaned = str(url_str).strip()
    # Strip any accidental leading/trailing single or double quotes or backticks
    cleaned = re.sub(r"^['\"`]+|['\"`]+$", "", cleaned).strip()

    if not cleaned:
        return ""

    # Disallow explicit non-web schemes
    lower = cleaned.lower()
    if lower.startswith(("file://", "javascript:", "data:", "ftp://", "vbscript:")):
        return cleaned

    # Auto-prepend https:// if protocol is missing
    if not (cleaned.startswith("http://") or cleaned.startswith("https://")):
        cleaned = "https://" + cleaned

    return cleaned


def validate_url_safety(url_str: str) -> str:
    """
    Strict SSRF validation:
    - Sanitizes input (strips quotes, prepends https:// if missing)
    - Scheme must be http or https
    - Hostname cannot resolve to loopback, private, link-local, multicast, cloud metadata or reserved IPs
    """
    sanitized = sanitize_url(url_str)
    parsed = urlparse(sanitized)

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL scheme. Only 'http' and 'https' protocols are permitted.",
        )

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="URL must contain a valid hostname.")

    # Reject localhost or well-known internal/cloud metadata names
    if hostname.lower() in (
        "localhost",
        "127.0.0.1",
        "::1",
        "metadata.google.internal",
        "instance-data",
        "169.254.169.254",
    ):
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
        return sanitized
    except ValueError:
        # Not a raw IP literal, proceed to domain name checks
        pass

    # Resolve IP and check if private/loopback/link-local (with tight 0.5s DNS lookup timeout)
    old_timeout = socket.getdefaulttimeout()
    try:
        socket.setdefaulttimeout(0.5)
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
        # If domain cannot be resolved by DNS, it is either dead, offline, or synthetic.
        pass
    finally:
        socket.setdefaulttimeout(old_timeout)

    return sanitized
