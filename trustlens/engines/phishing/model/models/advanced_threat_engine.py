"""
TrustLens Advanced Threat Engine

Features:
- URL normalization and registered-domain extraction
- Exact registered-domain allowlist signal
- Public-host validation before HTTP requests
- DNS and WHOIS intelligence
- Brand impersonation and typosquatting detection
- Manual HTTP redirect-chain inspection
- SMS/message scam indicators
- Combined URL analysis with network failures separated from phishing signals

Install:
    pip install requests tldextract python-whois dnspython
"""

import ipaddress
import re
import socket
from datetime import datetime, timezone
from difflib import SequenceMatcher
from urllib.parse import urljoin, urlparse

import dns.exception
import dns.resolver
import requests
import tldextract
import whois


class Member1AdvancedThreatEngine:
    """Advanced URL, domain, redirect, and scam-message analysis."""

    def __init__(self, brand_watchlist=None, timeout=8, max_redirects=8):
        default_brands = [
            "sbi", "onlinesbi", "hdfc", "icici", "axisbank",
            "pnb", "pnbindia", "bob", "bankofbaroda", "kotak",
            "paytm", "phonepe", "gpay", "googlepay", "bhim",
            "upi", "npci", "irctc", "digilocker", "uidai",
            "incometax", "incometaxindia", "indiapost",
            "india-post", "epfo", "parivahan",
            "paypal", "google", "amazon", "microsoft", "apple",
            "facebook", "instagram", "netflix", "whatsapp",
            "linkedin", "flipkart", "ebay", "twitter",
            "dropbox", "adobe", "outlook", "icloud",
        ]
        brands = default_brands if brand_watchlist is None else brand_watchlist
        self.brand_watchlist = {
            str(brand).strip().lower()
            for brand in brands
            if str(brand).strip()
        }

        self.allowlist_domains = {
            "google.com",
            "microsoft.com",
            "amazon.com",
            "apple.com",
            "paypal.com",
            "facebook.com",
            "instagram.com",
            "netflix.com",
            "wikipedia.org",
            "github.com",
            "python.org",
            "adamasuniversity.ac.in",
        }

        # Avoid runtime suffix-list downloads.
        self.extractor = tldextract.TLDExtract(suffix_list_urls=None)
        self.timeout = timeout
        self.max_redirects = max_redirects

        self.session = requests.Session()
        self.session.trust_env = False
        self.session.headers.update({
            "User-Agent": "TrustLens-Security-Scanner/1.0"
        })

    # ---------------------------------------------------------
    # URL NORMALIZATION AND DOMAIN EXTRACTION
    # ---------------------------------------------------------

    def normalize_url(self, url):
        """Validate and normalize an HTTP(S) URL."""
        if not isinstance(url, str) or not url.strip():
            raise ValueError("URL must be a non-empty string")

        url = url.strip()
        if not re.match(r"^https?://", url, re.IGNORECASE):
            url = "https://" + url

        try:
            parsed = urlparse(url)
            hostname = parsed.hostname
            parsed.port  # Validate malformed ports.
        except ValueError as error:
            raise ValueError(f"Invalid URL: {error}") from error

        if parsed.scheme.lower() not in ("http", "https"):
            raise ValueError("Only HTTP and HTTPS URLs are supported")
        if not hostname:
            raise ValueError("Invalid URL: hostname missing")
        if parsed.username or parsed.password:
            raise ValueError("URLs containing credentials are not supported")
        if any(char.isspace() for char in hostname):
            raise ValueError("Invalid hostname")

        return url

    def _get_hostname(self, url):
        return (urlparse(self.normalize_url(url)).hostname or "").lower().rstrip(".")

    def extract_domain(self, url):
        """Return the registered/root domain where suffix data is known."""
        hostname = self._get_hostname(url)
        try:
            ipaddress.ip_address(hostname)
            return hostname
        except ValueError:
            pass

        extracted = self.extractor(hostname)
        if extracted.domain and extracted.suffix:
            return extracted.top_domain_under_public_suffix
        return hostname

    def check_allowlist(self, url):
        """Exact registered-domain membership; this is not a safety verdict."""
        return self.extract_domain(url).lower() in self.allowlist_domains

    # ---------------------------------------------------------
    # HOST VALIDATION
    # ---------------------------------------------------------

    @staticmethod
    def _resolve_host(hostname):
        """
        Return (status, resolved_addresses).

        status is 'public', 'blocked', or 'dns_unavailable'. DNS failures are
        deliberately distinguished from private/reserved destinations.
        """
        try:
            literal_ip = ipaddress.ip_address(hostname)
            return (
                ("public", [str(literal_ip)])
                if literal_ip.is_global
                else ("blocked", [str(literal_ip)])
            )
        except ValueError:
            pass

        try:
            results = socket.getaddrinfo(
                hostname, None, type=socket.SOCK_STREAM
            )
            addresses = sorted({item[4][0] for item in results})
            if not addresses:
                return "dns_unavailable", []

            parsed_addresses = [ipaddress.ip_address(item) for item in addresses]
            if all(address.is_global for address in parsed_addresses):
                return "public", addresses
            return "blocked", addresses
        except socket.gaierror:
            return "dns_unavailable", []
        except (OSError, ValueError):
            return "dns_unavailable", []

    @staticmethod
    def is_public_host(hostname):
        """Boolean compatibility helper; True only for globally routable hosts."""
        status, _ = Member1AdvancedThreatEngine._resolve_host(hostname)
        return status == "public"

    # ---------------------------------------------------------
    # DNS AND WHOIS INTELLIGENCE
    # ---------------------------------------------------------

    def get_dns_domain_signals(self, url):
        """Collect DNS/WHOIS signals without treating lookup failure as malice."""
        domain = self.extract_domain(url)
        signals = {
            "domain": domain,
            "registrar": None,
            "creation_date": None,
            "domain_age_days": None,
            "is_newly_registered": None,
            "has_mx_records": False,
            "has_a_records": False,
            "has_aaaa_records": False,
            "nameservers": [],
            "mx_status": "not_checked",
            "a_status": "not_checked",
            "aaaa_status": "not_checked",
            "ns_status": "not_checked",
            "mx_error": None,
            "a_error": None,
            "aaaa_error": None,
            "ns_error": None,
            "dns_error": None,
            "whois_error": None,
        }

        # WHOIS can be rate-limited or unreachable. Failure is unknown evidence.
        try:
            info = whois.whois(domain)
            registrar = getattr(info, "registrar", None)
            if isinstance(registrar, list):
                registrar = next((item for item in registrar if item), None)
            signals["registrar"] = registrar

            creation_date = getattr(info, "creation_date", None)
            if isinstance(creation_date, list):
                creation_date = next(
                    (item for item in creation_date if item), None
                )
            if isinstance(creation_date, str):
                creation_date = datetime.fromisoformat(
                    creation_date.replace("Z", "+00:00")
                )

            if creation_date:
                if creation_date.tzinfo is None:
                    creation_date = creation_date.replace(tzinfo=timezone.utc)
                age = (datetime.now(timezone.utc) - creation_date).days
                if age >= 0:
                    signals["creation_date"] = str(creation_date)
                    signals["domain_age_days"] = age
                    signals["is_newly_registered"] = age < 30
        except Exception as error:
            signals["whois_error"] = str(error)

        resolver = dns.resolver.Resolver()
        resolver.lifetime = self.timeout
        resolver.timeout = min(3, self.timeout)
        dns_errors = []

        def lookup(record_type):
            try:
                answer = resolver.resolve(
                    domain, record_type, raise_on_no_answer=False
                )
                if answer.rrset is None:
                    return None, "no_records", None
                return list(answer), "found", None
            except dns.resolver.NoAnswer:
                return None, "no_records", None
            except dns.resolver.NXDOMAIN:
                return None, "not_found", None
            except (dns.exception.Timeout, dns.resolver.LifetimeTimeout) as error:
                return None, "lookup_error", str(error)
            except Exception as error:
                return None, "lookup_error", str(error)

        for record_type in ("MX", "A", "AAAA", "NS"):
            records, status, error = lookup(record_type)
            key = record_type.lower()
            signals[key + "_status"] = status

            if error:
                signals[key + "_error"] = error
                dns_errors.append(f"{record_type}: {error}")

            if record_type == "MX":
                signals["has_mx_records"] = bool(records)
            elif record_type == "A":
                signals["has_a_records"] = bool(records)
            elif record_type == "AAAA":
                signals["has_aaaa_records"] = bool(records)
            elif record_type == "NS" and records:
                signals["nameservers"] = [
                    str(record.target).rstrip(".") for record in records
                ]

        if dns_errors:
            signals["dns_error"] = "; ".join(dns_errors)

        return signals

    # ---------------------------------------------------------
    # TYPOSQUATTING AND BRAND IMPERSONATION
    # ---------------------------------------------------------

    @staticmethod
    def _clean_brand_label(label):
        substitutions = str.maketrans({
            "0": "o",
            "1": "l",
            "3": "e",
            "5": "s",
            "7": "t",
            "@": "a",
        })
        return (
            label.lower()
            .replace("-", "")
            .replace("_", "")
            .translate(substitutions)
        )

    def detect_typosquatting(self, url):
        """
        Compare hostname labels with known brands.

        This is heuristic detection, not a definitive malware verdict.
        """
        normalized = self.normalize_url(url)
        hostname = self._get_hostname(normalized)
        registered_domain = self.extract_domain(normalized)

        try:
            ipaddress.ip_address(hostname)
            return {
                "is_typosquat": False,
                "target_brand": None,
                "evaluated_sld": registered_domain,
                "matched_label": None,
                "reason": "IP address; brand comparison skipped",
                "similarity": None,
            }
        except ValueError:
            pass

        extracted = self.extractor(hostname)
        domain_sld = (extracted.domain or hostname).lower()
        labels = hostname.split(".")

        if registered_domain in self.allowlist_domains:
            return {
                "is_typosquat": False,
                "target_brand": None,
                "evaluated_sld": domain_sld,
                "matched_label": None,
                "reason": "Exact allowlisted registered domain",
                "similarity": None,
            }

        best_match = None
        for label in labels:
            clean_value = self._clean_brand_label(label)

            for brand in self.brand_watchlist:
                clean_brand = self._clean_brand_label(brand)
                if not clean_brand:
                    continue

                exact_brand_subdomain = (
                    label == brand and label != domain_sld
                )
                if label == brand and not exact_brand_subdomain:
                    continue

                similarity = SequenceMatcher(
                    None, clean_value, clean_brand
                ).ratio()

                exact_lookalike = (
                    clean_value == clean_brand and not exact_brand_subdomain
                )
                brand_in_label = (
                    exact_brand_subdomain
                    or (
                        clean_brand in clean_value
                        and len(clean_value) > len(clean_brand)
                    )
                )
                close_match = len(clean_value) >= 4 and similarity >= 0.80

                if exact_lookalike or brand_in_label or close_match:
                    candidate = {
                        "is_typosquat": True,
                        "target_brand": brand,
                        "evaluated_sld": domain_sld,
                        "matched_label": label,
                        "reason": (
                            "character substitution"
                            if exact_lookalike
                            else "brand embedded in hostname label"
                            if brand_in_label
                            else "similarity-based brand match"
                        ),
                        "similarity": round(similarity, 3),
                    }
                    if (
                        best_match is None
                        or similarity > best_match["similarity"]
                    ):
                        best_match = candidate

        if best_match:
            return best_match

        return {
            "is_typosquat": False,
            "target_brand": None,
            "evaluated_sld": domain_sld,
            "matched_label": None,
            "reason": "No matching brand impersonation pattern found",
            "similarity": None,
        }

    # ---------------------------------------------------------
    # REDIRECT CHAIN ANALYSIS
    # ---------------------------------------------------------

    def analyze_redirect_chain(self, url):
        """
        Inspect redirects manually.

        Network/DNS timeouts are reported as unavailable analysis, not as
        phishing evidence. Non-public destinations remain blocked.
        """
        current_url = self.normalize_url(url)
        result = {
            "initial_url": current_url,
            "final_destination": None,
            "total_hops": 0,
            "hop_path": [],
            "redirect_detected": False,
            "status_codes": [],
            "redirect_destinations": [],
            "ssl_error": None,
            "error": None,
            "analysis_status": "complete",
            "failure_type": None,
        }
        redirect_codes = (301, 302, 303, 307, 308)

        for hop in range(self.max_redirects + 1):
            try:
                parsed = urlparse(current_url)
                hostname = parsed.hostname

                if parsed.scheme not in ("http", "https") or not hostname:
                    raise ValueError("Invalid redirect destination")

                host_status, _ = self._resolve_host(hostname)
                if host_status == "dns_unavailable":
                    result.update({
                        "error": "DNS resolution unavailable for destination",
                        "analysis_status": "network_unavailable",
                        "failure_type": "dns",
                        "total_hops": hop,
                    })
                    return result
                if host_status == "blocked":
                    result.update({
                        "error": "Blocked non-public destination",
                        "analysis_status": "blocked",
                        "failure_type": "non_public_destination",
                        "total_hops": hop,
                    })
                    return result

                result["hop_path"].append(current_url)

                with self.session.get(
                    current_url,
                    allow_redirects=False,
                    timeout=self.timeout,
                    stream=True,
                    verify=True,
                ) as response:
                    status = response.status_code
                    location = response.headers.get("Location")

                result["status_codes"].append(status)

                if status not in redirect_codes:
                    result["final_destination"] = current_url
                    result["total_hops"] = hop
                    result["redirect_detected"] = hop > 0
                    return result

                if not location:
                    result.update({
                        "final_destination": current_url,
                        "total_hops": hop,
                        "redirect_detected": hop > 0,
                        "error": "Redirect response missing Location header",
                        "analysis_status": "partial",
                        "failure_type": "invalid_redirect",
                    })
                    return result

                if hop >= self.max_redirects:
                    result.update({
                        "total_hops": hop,
                        "redirect_detected": True,
                        "error": "Maximum redirects exceeded",
                        "analysis_status": "partial",
                        "failure_type": "redirect_limit",
                    })
                    return result

                next_url = self.normalize_url(urljoin(current_url, location))
                result["redirect_destinations"].append(next_url)
                result["redirect_detected"] = True
                current_url = next_url

            except requests.exceptions.SSLError as error:
                result.update({
                    "ssl_error": str(error),
                    "error": "SSL certificate verification failed",
                    "analysis_status": "partial",
                    "failure_type": "ssl",
                    "total_hops": hop,
                })
                return result
            except requests.exceptions.Timeout as error:
                result.update({
                    "error": f"Connection timed out: {error}",
                    "analysis_status": "network_unavailable",
                    "failure_type": "timeout",
                    "total_hops": hop,
                })
                return result
            except requests.exceptions.ConnectionError as error:
                result.update({
                    "error": f"Connection failed: {error}",
                    "analysis_status": "network_unavailable",
                    "failure_type": "connection",
                    "total_hops": hop,
                })
                return result
            except requests.RequestException as error:
                result.update({
                    "error": str(error),
                    "analysis_status": "partial",
                    "failure_type": "http",
                    "total_hops": hop,
                })
                return result
            except ValueError as error:
                result.update({
                    "error": str(error),
                    "analysis_status": "blocked",
                    "failure_type": "validation",
                    "total_hops": hop,
                })
                return result

        return result

    # ---------------------------------------------------------
    # SMS AND MESSAGE SCAM DETECTION
    # ---------------------------------------------------------

    def analyze_scam_message(self, message):
        """Extract contact indicators and identify common scam language."""
        if not isinstance(message, str):
            message = str(message)

        text = message.lower()
        urls = re.findall(
            r"https?://[^\s<>\"']+|"
            r"(?<![@\w])(?:www\.)?[a-zA-Z0-9-]+\."
            r"(?:com|in|net|org|co|io|gov|edu)"
            r"(?:/[^\s<>\"']*)?",
            message,
            re.IGNORECASE,
        )
        emails = re.findall(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            message,
        )
        phones = re.findall(
            r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)",
            message,
        )
        upi_handles = re.findall(
            r"\b[a-zA-Z0-9._-]+@[a-zA-Z0-9]+\b",
            message,
        )

        keyword_groups = {
            "Urgency/Pressure Lure": [
                "urgent", "immediately", "act now", "limited time",
                "expire today", "within 24 hours", "suspended",
            ],
            "Credential/OTP Harvest": [
                "otp", "password", "pin", "verify account",
                "login details", "share your code", "verification code",
            ],
            "KYC/Account Suspension Scam": [
                "kyc", "account blocked", "account suspended",
                "update your account", "bank account blocked",
            ],
            "Prize/Reward Scam": [
                "winner", "lottery", "cashback", "refund",
                "claim prize", "free reward",
            ],
            "Payment/Financial Pressure": [
                "pay now", "send money", "transfer money",
                "processing fee", "bank details",
            ],
        }

        indicators = [
            indicator
            for indicator, keywords in keyword_groups.items()
            if any(keyword in text for keyword in keywords)
        ]

        return {
            "suspicious_language_indicators": indicators,
            "verified_evidence": {
                "urls": urls,
                "emails": emails,
                "phones": phones,
                "upi_handles": upi_handles,
            },
            "risk_indicator_count": len(indicators),
            "message_requires_review": bool(indicators or urls),
        }

    # ---------------------------------------------------------
    # COMPLETE URL ANALYSIS
    # ---------------------------------------------------------

    def analyze_url(self, url):
        """Run all modules and keep security signals separate from availability."""
        normalized_url = self.normalize_url(url)
        allowlisted = self.check_allowlist(normalized_url)
        typosquat = self.detect_typosquatting(normalized_url)
        dns_signals = self.get_dns_domain_signals(normalized_url)
        redirect_signals = self.analyze_redirect_chain(normalized_url)

        risk_signals = []
        analysis_warnings = []

        if typosquat["is_typosquat"]:
            risk_signals.append(
                "Possible brand impersonation/typosquatting"
            )

        if dns_signals.get("is_newly_registered") is True:
            risk_signals.append("Recently registered domain")

        if redirect_signals["total_hops"] > 3:
            risk_signals.append("Long redirect chain")

        # A verified SSL certificate failure is retained as a security signal.
        # A timeout or DNS failure is only an availability warning.
        if redirect_signals["failure_type"] == "ssl":
            risk_signals.append("SSL certificate verification failure")

        if dns_signals.get("dns_error"):
            analysis_warnings.append("Some DNS lookups were unavailable")
        if dns_signals.get("whois_error"):
            analysis_warnings.append("WHOIS information was unavailable")
        if redirect_signals.get("analysis_status") == "network_unavailable":
            analysis_warnings.append("Redirect analysis unavailable due to network/DNS failure")
        elif redirect_signals.get("analysis_status") in ("partial", "blocked"):
            analysis_warnings.append(
                redirect_signals.get("error") or "Redirect analysis incomplete"
            )

        if (
            dns_signals.get("dns_error")
            or redirect_signals.get("analysis_status") == "network_unavailable"
        ):
            analysis_status = "partial"
        elif redirect_signals.get("analysis_status") in ("partial", "blocked"):
            analysis_status = "partial"
        else:
            analysis_status = "complete"

        return {
            "url": normalized_url,
            "domain": self.extract_domain(normalized_url),
            "allowlisted": allowlisted,
            "typosquatting": typosquat,
            "domain_intelligence": dns_signals,
            "redirect_analysis": redirect_signals,
            "analysis_status": analysis_status,
            "analysis_warnings": analysis_warnings,
            "risk_signals": risk_signals,
            "requires_review": bool(risk_signals),
            "disclaimer": (
                "Heuristic security signals only. Network lookup failures do "
                "not prove a URL is malicious. This result is not a guarantee "
                "that a URL is safe or malicious."
            ),
        }

    def close(self):
        """Close the underlying HTTP session."""
        self.session.close()


# ---------------------------------------------------------
# TESTING
# ---------------------------------------------------------

if __name__ == "__main__":
    import json

    engine = Member1AdvancedThreatEngine()

    test_urls = [
        "https://www.google.com",
        "https://www.paypal.com",
        "https://paypa1.com",
        "https://paypa1-login.com",
        "https://www.g00gle.com",
        "https://amaz0n-login.com",
        "https://secure-paypal.com",
        "https://www.microsoft.com",
        "https://www.sbi.co.in",
    ]

    try:
        for test_url in test_urls:
            print(f"\nURL ANALYSIS: {test_url}")
            try:
                result = engine.analyze_url(test_url)
                print(json.dumps(result, indent=4, default=str))
            except Exception as error:
                print("URL analysis error:", error)

        sample_sms = (
            "URGENT! Your bank account will be suspended. "
            "Verify your OTP and complete KYC immediately."
        )
        print("\nSMS ANALYSIS:")
        sms_result = engine.analyze_scam_message(sample_sms)
        print(json.dumps(sms_result, indent=4, default=str))

    finally:
        engine.close()
