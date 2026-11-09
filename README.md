# TrustLens
**A multi-signal digital trust engine and threat triage console featuring immutable Web3 cryptographic proof.**

## 1. Problem
The digital landscape is plagued by increasingly sophisticated threats—such as targeted phishing clones, domain typosquatting, and silent cryptographic hazards (e.g., factorable RSA moduli or distrusted Certificate Authorities). Furthermore, traditional security scanners operate as "black boxes" without verifiable audit trails, forcing organizations to blindly trust centralized security platforms that could theoretically be tampered with or modified after an investigation. 

## 2. Solution
TrustLens operates a deterministic, passive 5-stage investigation pipeline to instantly detect and triage threats. It utilizes a Dual-Engine architecture: a high-performance **Rust Security Core** (for deep cryptographic inspection, Fermat RSA sieves, and CA hygiene) running simultaneously alongside an **ML Phishing Engine** (for lexical typosquatting and visual clone detection). 

Beyond detection, TrustLens features an **Independent Web3 Verifier**. Every completed security report is canonically hashed locally in the browser (RFC 8785 Keccak-256) and anchored to a public Ethereum smart contract. This allows anyone to cryptographically audit the authenticity of a security report without relying on our backend infrastructure.

## 3. Demo Links and a Screenshot
* **Live Production Dashboard:** [https://hackmatrixadamas.vercel.app](https://hackmatrixadamas.vercel.app)
* **Backend API Gateway:** `https://trustlens-gateway.onrender.com` (Example)

![TrustLens Security Investigation Overview](image_2d063e.jpg)

## 4. Tech Stack
* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Web3 Ethers.js client.
* **API Gateway & Routing:** FastAPI, Python, Uvicorn.
* **Machine Learning Engine:** Python, XGBoost (26-Feature TreeExplainer), SHAP.
* **Security Core Engine:** Rust, Actix-web, Tokio (Asynchronous execution).
* **Blockchain / Web3:** Solidity (Smart Contracts), Hardhat, Ethereum Sepolia Testnet.
* **Infrastructure / Deployment:** Docker Compose, Vercel (Frontend), Render (Microservices).

## 5. Architecture
TrustLens utilizes a distributed microservices architecture:
1. **Client Interface:** Users submit targets via the Next.js frontend or browser extension.
2. **FastAPI Gateway:** The central router receives the request and fans it out concurrently to the downstream engines.
3. **Rust Security Engine:** Executes rapid cryptographic checks (SSL/TLS linters, CA validation, formatting constraints).
4. **Python ML Engine:** Analyzes lexical and structural data to predict typosquatting and clone signals.
5. **In-Memory Threat Graph:** Maps relationships between IPs, domains, and known threat actor infrastructure.
6. **Smart Contract Registry:** The frontend locally canonicalizes the final fused report and anchors the Keccak-256 hash to the EVM registry for future tamper-proof auditing.

## 6. Setup and Run Steps
Ensure you have Docker, Node.js (v18+), Rust/Cargo, and Python installed on your system.

**1. Clone the repository:**
```bash
git clone [https://github.com/swastikadass2006-cmd/Hackmatrix_adamas.git](https://github.com/swastikadass2006-cmd/Hackmatrix_adamas.git)
cd Hackmatrix_adamas/trustlens
