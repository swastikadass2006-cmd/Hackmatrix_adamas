# TrustLens 🛡️
> **A multi-signal digital trust engine, threat triage console, and social engineering analyzer featuring immutable Web3 cryptographic proof.**

[![Release](https://img.shields.io/badge/release-v1.0.0-emerald.svg)](https://github.com/swastikadass2006-cmd/Hackmatrix_adamas/releases/tag/v1.0.0)
[![Accuracy](https://img.shields.io/badge/accuracy-100%25-brightgreen.svg)](docs/TESTING_REPORT.md)
[![SSRF Protection](https://img.shields.io/badge/SSRF-100%25%20blocked-blue.svg)](docs/SECURITY.md)
[![Web3 Network](https://img.shields.io/badge/Ethereum-Sepolia%20Testnet-purple.svg)](https://sepolia.etherscan.io/address/0x4b791449348d61B4f80FaA2B99a6111f1E8b6e6F)

---

## 1. Problem
The digital landscape is plagued by increasingly sophisticated threats—such as targeted phishing clones, domain typosquatting, SMS/UPI social engineering, and silent cryptographic hazards (e.g., factorable RSA moduli or distrusted Certificate Authorities). Furthermore, traditional security scanners operate as "black boxes" without verifiable audit trails, forcing organizations to blindly trust centralized security platforms that could theoretically be tampered with or modified after an investigation. 

## 2. Solution
TrustLens operates a deterministic, passive 5-stage investigation pipeline to instantly detect and triage threats. It utilizes a Dual-Engine architecture: a high-performance **Rust Security Core** (for deep cryptographic inspection, Fermat RSA sieves, and CA hygiene) running simultaneously alongside an **ML Phishing Engine** (for lexical typosquatting and visual clone detection). 

Beyond detection, TrustLens features an **Independent Web3 Verifier**. Every completed security report is canonically hashed locally in the browser (RFC 8785 Keccak-256) and anchored to a public Ethereum smart contract. This allows anyone to cryptographically audit the authenticity of a security report without relying on our backend infrastructure.

---

## 3. Live Deployments & Demo Links

| Service / Interface | Host / Platform | Live Endpoint URL | Status |
| :--- | :--- | :--- | :--- |
| **Next.js Web Frontend** | Vercel Global Edge | [https://hackmatrixadamas.vercel.app](https://hackmatrixadamas.vercel.app) | **Live** |
| **Threat Scanner Portal** | Vercel | [https://hackmatrixadamas.vercel.app/scanner](https://hackmatrixadamas.vercel.app/scanner) | **Live** |
| **Scam Message Analyzer** | Vercel | [https://hackmatrixadamas.vercel.app/analyze](https://hackmatrixadamas.vercel.app/analyze) | **Live** |
| **Web3 Verifier** | Vercel | [https://hackmatrixadamas.vercel.app/verify](https://hackmatrixadamas.vercel.app/verify) | **Live** |
| **Threat Console** | Vercel | [https://hackmatrixadamas.vercel.app/threat-console](https://hackmatrixadamas.vercel.app/threat-console) | **Live** |
| **Phishing ML Engine** | Render Cloud | [https://hackmatrix-adamas.onrender.com](https://hackmatrix-adamas.onrender.com) | **Live** |
| **Smart Contract Registry** | Ethereum Sepolia | [`0x4b791449348d61B4f80FaA2B99a6111f1E8b6e6F`](https://sepolia.etherscan.io/address/0x4b791449348d61B4f80FaA2B99a6111f1E8b6e6F) | **Configured** |
| **Telegram Community Bot** | Telegram | `@redOrbitBot` (`trustlens/bot`) | **Ready** |

---

## 4. Tech Stack
* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Web3 Ethers.js client.
* **API Gateway & Routing:** FastAPI, Python 3.11, Uvicorn, AnyIO.
* **Machine Learning Engine:** Python, XGBoost (26-Feature TreeExplainer), SHAP.
* **Security Core Engine:** Rust, Axum, Tokio (Asynchronous execution), tiny-keccak, serde_jcs.
* **Blockchain / Web3:** Solidity 0.8.20 (Smart Contracts), Hardhat, Ethers.js v6, Ethereum Sepolia Testnet.
* **Infrastructure / Deployment:** Docker Compose, Vercel (Frontend), Render (Microservices), PostgreSQL 15, Redis 7.

---

## 5. System Architecture

```mermaid
graph TD
    Client["Client (Web App / Telegram Bot / Extensions)"] -->|HTTPS / REST| Gateway["FastAPI Gateway (:8000)"]
    Gateway -->|Safe Socket Connect| NetInspect["Network Inspector (DNS / Multi-Hop Redirects)"]
    Gateway -->|REST (:8001)| RustCore["Rust Security Engine (:8001)<br/>• Fermat Sieve • eMudhra CCADB Distrust • RFC 8785"]
    Gateway -->|HTTPS Remote Sync| RenderML["XGBoost ML Engine (Render Cloud)<br/>• 26-Feature XGBoost • SHAP Explainer"]
    Gateway -->|Embedded In-Process| ThreatGraph["Deterministic Threat Graph & Threat Intel DB"]
    Gateway -->|PostgreSQL / Redis| Storage["PostgreSQL 15 & Redis 7"]
    Client -->|Direct JSON-RPC (Alchemy)| Web3["Ethereum Sepolia Smart Contract Registry"]
```

### Architecture Pipeline Flow:
1. **Client Interface:** Users submit targets via the Next.js frontend, Telegram bot, or browser extension.
2. **FastAPI Gateway:** The central router receives the request, sanitizes inputs, enforces strict SSRF boundary validation, and coordinates analysis across downstream engines.
3. **Rust Security Engine:** Executes rapid cryptographic checks (SSL/TLS linters, Fermat factorization sieve, eMudhra CCADB subordinate distrust, and RFC 8785 canonical hashing).
4. **Python ML Engine:** Analyzes lexical and structural data to predict typosquatting and clone signals with SHAP feature contribution explanations.
5. **Threat Graph:** Maps relationships between IPs, domains, and known threat actor infrastructure.
6. **Smart Contract Registry:** Anchors the RFC 8785 Keccak-256 digest to the Ethereum Sepolia EVM registry for immutable, tamper-evident auditing.

---

## 6. Setup and Run Steps

Ensure you have Docker, Node.js (v18+), Rust/Cargo, and Python installed.

### 1. Launch with Docker Compose
```bash
# Clone the repository
git clone https://github.com/swastikadass2006-cmd/Hackmatrix_adamas.git
cd Hackmatrix_adamas/trustlens

# Launch all microservices
docker compose up -d --build
```

Services will be accessible at:
- **Web Frontend:** `http://localhost:3000`
- **FastAPI Gateway:** `http://localhost:8000` (`http://localhost:8000/docs`)
- **Rust Security Engine:** `http://localhost:8001`

---

## 7. Verification & Reproducibility Suite

Run the exact test harnesses used for the v1.0.0 compliance audit:

```bash
# 1. Run 40-case ground-truth test suite & metric calculator (100% pass)
python3 tests/run_suite.py

# 2. Run latency benchmark suite (p50 / p95)
python3 tests/benchmark_latency.py

# 3. Run Rust Security Engine tests (RFC 8785 & Keccak-256 test vector)
cd trustlens/engines/security_engine && cargo test

# 4. Run Smart Contract invariant tests
cd trustlens/contracts && node scripts/test-contract.js

# 5. Run Telegram Bot mock test suite
docker exec trustlens-api_gateway-1 pytest -v /tmp/bot/test_bot.py
```

### Benchmark Metrics Summary
- **Overall Accuracy:** `100.00%` (40/40 cases passed)
- **Precision:** `100.00%` | **Recall:** `100.00%` | **F1 Score:** `100.00%`
- **False Positive Rate:** `0.00%`
- **SSRF Block Rate:** `100.00%` (10/10 attacks neutralized)
- **Rust Engine Cryptographic Latency (p50):** `1.60 ms`

---

## 8. Environment Variables Reference

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://trustlens:hackathon2026@postgres:5432/trustlensdb` | Yes |
| `REDIS_URL` | Redis cache connection string | `redis://redis:6379/0` | Yes |
| `SECURITY_ENGINE_URL` | Rust engine inspection endpoint | `http://rust_security:8001/api/v1/security/analyze` | Yes |
| `RENDER_ML_URL` | Remote XGBoost model endpoint | `https://hackmatrix-adamas.onrender.com/predict` | Yes |
| `ALLOWED_ORIGINS` | Permitted CORS origins | `https://hackmatrixadamas.vercel.app` | Production |
| `TELEGRAM_BOT_TOKEN` | API token from Telegram BotFather | `your_bot_token_here` | For Bot |
| `SEPOLIA_RPC_URL` | Ethereum Sepolia RPC endpoint | `https://ethereum-sepolia.publicnode.com` | For Web3 Deploy |
| `SEPOLIA_PRIVATE_KEY` | Deployer wallet testnet private key | `0x...` | For Web3 Deploy |

---

## 9. Limitations & Operational Disclaimers

1. **Non-Intrusive Inspection:** TrustLens operates as a passive inspection framework. It does not exploit target servers or perform aggressive penetration testing.
2. **TLS Certificate Disclaimer:** A valid TLS certificate verifies encryption and host control, but **never guarantees that the site owner or business is legitimate or safe**.
3. **Absence of Indicators:** A clean scan indicates that zero known malicious signatures were detected across evaluated modules; it is **never presented as an absolute guarantee of safety**.
4. **Linguistic Heuristics:** In social engineering and scam analysis, urgency vocabulary is treated as *"Signals, not proof"* and never triggers a fraud verdict on its own.
