# Certificate and Web Security Lead Deliverables

## 1. Testing Report

The following tests were conducted to validate the zero-trust network fetcher and certificate intelligence logic against both benign and malicious targets.

| Target URL | Classification | Key Findings / Signals | Severity | Engine Evidence |
| :--- | :--- | :--- | :--- | :--- |
| `http://169.254.169.254` | **Blocked** | SSRF_Policy_Violation | High | Connection aborted: Resolved IP is private, loopback, or restricted. |
| `https://emudhra-test-site.com` | **High Risk** | Distrusted_Certificate_Authority | Critical | Certificate issued by distrusted CA (eMudhra Compromised Root CA). Violates CCADB root baseline. |
| `http://onlinesbi-kyc-pan-update.top` | **Suspicious** | Missing_Security_Headers | Medium | Missing HSTS and CSP headers; lack of secure transport enforcement. |
| `https://www.google.com` | **Safe** | Valid_Certificate_Authority | Info | Certificate issued by trusted CA; SSRF fetcher resolved external IP successfully. |
| `https://github.com` | **Safe** | Valid_Certificate_Authority | Info | Valid TLS chain; no recent newly minted certificates found in CT logs. |
| `https://www.rust-lang.org` | **Safe** | Valid_Certificate_Authority | Info | Safe redirect handling completed; secure headers present; trusted issuer. |

---
