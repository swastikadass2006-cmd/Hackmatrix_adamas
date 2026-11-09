# TrustLens 🛡️
> **Decentralized Multi-Signal Cyber Threat Detection, Social Engineering Triage & Verifiable Report Registry**

[![Release](https://img.shields.io/badge/release-v1.0.0-emerald.svg)](https://github.com/swastikadass2006-cmd/Hackmatrix_adamas/releases/tag/v1.0.0)
[![Accuracy](https://img.shields.io/badge/accuracy-100%25-brightgreen.svg)](docs/TESTING_REPORT.md)
[![SSRF Protection](https://img.shields.io/badge/SSRF-100%25%20blocked-blue.svg)](docs/SECURITY.md)
[![Web3 Network](https://img.shields.io/badge/Ethereum-Sepolia%20Testnet-purple.svg)](https://sepolia.etherscan.io/address/0x4b791449348d61B4f80FaA2B99a6111f1E8b6e6F)

---

## 🌐 Live Deployments & Endpoints

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

## 🏛️ System Architecture

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

---

## ⚡ Quick Start (Local Development)

### 1. Launch with Docker Compose
```bash
# Clone and enter workspace
git clone git@github.com:swastikadass2006-cmd/Hackmatrix_adamas.git
cd Hackmatrix_adamas/trustlens

# Launch all microservices
docker compose up -d --build
```

Services will be accessible at:
- **Web Frontend:** `http://localhost:3000`
- **FastAPI Gateway:** `http://localhost:8000` (`http://localhost:8000/docs`)
- **Rust Security Engine:** `http://localhost:8001`

---

## 🧪 Verification & Reproducibility Suite

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

## 📐 Environment Variables Reference

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

## 🛡️ Limitations & Operational Disclaimers

1. **Non-Intrusive Inspection:** TrustLens operates as a passive inspection framework. It does not exploit target servers or perform aggressive penetration testing.
2. **TLS Certificate Disclaimer:** A valid TLS certificate verifies encryption and host control, but **never guarantees that the site owner or business is legitimate or safe**.
3. **Absence of Indicators:** A clean scan indicates that zero known malicious signatures were detected across evaluated modules; it is **never presented as an absolute guarantee of safety**.
4. **Linguistic Heuristics:** In social engineering and scam analysis, urgency vocabulary is treated as *"Signals, not proof"* and never triggers a fraud verdict on its own.
