# TrustLens
# TrustLens 🛡️

TrustLens is an intelligent, multi-layered phishing and malicious website detection platform built with an "India-first" security context. It combines high-performance low-level system engines with modern API gateways to provide real-time threat intelligence, certificate integrity auditing, and passive web hygiene scans.

---

## 🏗️ System Architecture

TrustLens uses a microservice-based architecture designed for optimal performance, memory safety, and minimal latency:

*   **API Gateway (`/gateway`):** Orchestrates incoming client requests using FastAPI, coordinating scans across distributed analysis engines.
*   **Security Engine (`/engines/security_engine`):** A high-performance, memory-safe backend written in **Rust** (powered by `axum` and `tokio`) running on port `8001`. It handles low-level socket connections, TLS certificate inspection, Certificate Transparency logs, and passive header audits.
*   **Phishing & Intel Engines (`/engines/phishing`, `/engines/intel`):** Multi-factor analysis pipelines for heuristic classification and community threat feeds.
*   **Client Interfaces (`/extension`, `/frontend`, `/bot`):** Browser extensions, web dashboards, and notification bots providing seamless user interaction.

---

## 🔒 Certificate & Web Security Engine (Member 2 Module)

Maintained by the Certificate & Web Security Lead, the Rust-based security engine (`security_engine`) provides deep cryptographic and network inspection:

1.  **Trust Chain Inspector & eMudhra Demo:** Establishes raw TCP/TLS connections (bypassing invalid cert warnings to analyze broken or malicious chains) and checks issuer blocklists to specifically flag vulnerable key-generation issues (such as the eMudhra incident).
2.  **Weak-Key Linter:** Parses raw X.509 public key parameters to identify sub-standard RSA modulus lengths (< 2048 bits) or weak elliptic curve configurations.
3.  **Certificate Transparency (CT) Monitor:** Queries public `crt.sh` logs asynchronously to analyze certificate issuance timestamps, immediately flagging newly minted domains (< 3 days old) typical of advanced phishing campaigns.
4.  **Web Hygiene Scanner:** Passively audits HTTP transport headers for security posture, checking for missing HSTS headers and exposed server software version banners.

---

## 🚀 API Contract

The Rust security engine exposes a high-throughput endpoint for the gateway:

*   **Endpoint:** `GET /api/v1/security/analyze`
*   **Query Parameter:** `?url=<target_url>`
*   **Response Format:** Returns a structured JSON payload containing risk scores and evidence signals:

```json
{
  "url": "[https://example.com](https://example.com)",
  "results": [
    {
      "engine_name": "TrustChain",
      "risk_score": 0,
      "evidence": []
    },
    {
      "engine_name": "CTMonitor",
      "risk_score": 0,
      "evidence": []
    },
    {
      "engine_name": "WebHygiene",
      "risk_score": 10,
      "evidence": [
        {
          "signal": "Missing HSTS",
          "severity": "medium",
          "explanation": "Missing Strict-Transport-Security allows downgrade attacks."
        }
      ]
    }
  ]
}
