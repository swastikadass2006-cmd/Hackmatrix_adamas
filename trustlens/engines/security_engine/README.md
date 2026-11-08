## 2. Technical Documentation: Security Methodology

*Note: Add this section to your team's main README.md or technical architecture documentation.*

**Security & Web Trust Methodology**

Our platform evaluates target URLs through a strict, zero-trust pipeline before any application-level or AI analysis occurs. The security engine prioritizes verifiable cryptographic and network evidence to classify threats.

* **SSRF-Safe Network Validation:** To prevent Server-Side Request Forgery (SSRF) and bypass attacks, automatic redirect handling is disabled. Our custom Rust network fetcher manually parses every redirect hop and resolves all hostnames to their underlying IP addresses. Connections are aggressively dropped if they resolve to loopback (`127.0.0.0/8`), private (`10.0.0.0/8`, `192.168.0.0/16`), link-local, or cloud metadata (`169.254.169.254`) ranges. Payloads are strictly bounded to 5MB to prevent memory exhaustion.
* **Cryptographic Trust & Certificate Intelligence:** A valid TLS connection does not guarantee a safe entity. We inspect the certificate chain against a curated intelligence blocklist of known compromised, distrusted, or revoked Certificate Authorities (e.g., historical eMudhra incidents, WoSign). The presence of a distrusted root or intermediate CA triggers an immediate "Hard Override" to a Critical risk classification.
* **Certificate Transparency (CT) Monitoring:** We query `crt.sh` to determine if a certificate was recently minted (within the last 72 hours). While not inherently malicious, newly minted certificates for high-value targets often correlate with active, ephemeral phishing campaigns.
* **Passive Web Hygiene:** We conduct non-intrusive audits of the target's HTTP security posture. This includes detecting missing `Strict-Transport-Security` (HSTS) headers, missing `Content-Security-Policy` (CSP) headers, and exposed server identity banners that could facilitate reconnaissance.
