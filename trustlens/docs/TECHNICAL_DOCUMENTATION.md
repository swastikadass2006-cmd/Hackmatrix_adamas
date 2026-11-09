# TrustLens Technical Architecture & System Documentation
**Project:** TrustLens — Multi-Signal Cyber Threat Intelligence & Digital Trust Registry  
**Satisfies Hackathon Deliverables:** Deliverable #2 (Architecture & Pipeline), Deliverable #6 (Web3 Specifications), Deliverable #7 (Operational Deployment Runbook)

---

## 1. 🏛️ High-Level System Architecture

```mermaid
flowchart TD
    User["End User / SOC Analyst"] --> Frontend["Next.js 14 Dashboard (:3000)<br/>• App Router & React 18<br/>• TailwindCSS & Lucide<br/>• Vitest Unit Tests"]
    Frontend -->|"POST /scan (60s Timeout)"| Gateway["FastAPI Gateway (:8000)<br/>• SSRF Guard & Normalizer<br/>• Five-Tier Fusion Engine<br/>• Anti-Hallucination Explainer"]
    Frontend -->|"RFC 8785 + Keccak-256"| Web3["Ethereum Sepolia Testnet<br/>TrustLensRegistry.sol<br/>(:11155111)"]

    subgraph Distributed_Engines["Distributed Security & Analysis Engines"]
        Gateway -->|"Async GET"| RustCore["Rust Security Engine (:8001)<br/>• OpenSSL X.509 Chain Linter<br/>• Fermat Sieve RSA Modulus Linter<br/>• eMudhra Distrust CCADB Policy<br/>• Passive Header Hygiene"]
        Gateway -->|"In-Process & POST"| PhishML["Phishing & ML Engine<br/>• 26-Feature XGBoost Classifier<br/>• India-First Brand Spoofing<br/>• Punycode & IDN Homographs<br/>• Shannon Lexical Entropy"]
        Gateway -->|"Local SQLite / PG"| ThreatDB["Threat Intelligence & DB<br/>• STIX 2.1 Bundles<br/>• Community Vote Deduplication<br/>• ASN & Graph Correlation"]
    end

    Gateway -->|"Structured Dossier"| Frontend
    Frontend -->|"Tamper-Evident Proof"| Verifier["Independent Client Verifier<br/>(:3000/verify)"]
```

---

## 2. 🎯 The Five-Tier Risk Classification System (Module 1 & 4)

TrustLens rejects binary "safe/unsafe" verdicts in favor of a five-tier threat taxonomy:

| Tier | Verdict | Trigger Criteria | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| **Tier 1: Confirmed Malicious** | `malicious` | Authoritative threat feed hit, verified community blacklist threshold, or confirmed credential harvesting endpoint. | **DO NOT PROCEED.** Active threat confirmed. Disconnect immediately and block via firewall/SOAR. |
| **Tier 2: High Risk** | `malicious` | Critical cryptographic flaw (eMudhra CA distrust, Fermat weak key) or brand lookalike targeting banking/government. | **CRITICAL RISK.** Hostile impersonation or severely compromised cryptographic trust. |
| **Tier 3: Suspicious** | `suspicious` | Heuristic lexical anomalies, disposable TLDs (`.top`, `.xyz`), unvalidated open redirect, or missing transport hygiene. | **PROCEED WITH CAUTION.** Anomaly detected. Verify authenticity before submitting credentials. |
| **Tier 4: Safe / Verified Safe** | `safe` | Valid public trust anchor, strict transport security headers, and zero threat indicators. | **SAFE TO BROWSE.** Conforms to enterprise trust baselines. *(Absence of threats != 100% safety).* |
| **Tier 5: Inconclusive** | `inconclusive` | Core engine timeout, unreachable network target, or rate-limited verification. | **INCONCLUSIVE.** Automated audit could not complete. Re-scan required. |

---

## 3. 🔐 Cryptographic & TLS Analysis Engine (Module 2)

Built with pure Rust (`engines/security_engine`) using OpenSSL and Tokio:
1. **CCADB CA Distrust & Subordinate Revocation:**
   - Detects compromised or distrusted root/intermediate authorities, specifically enforcing the **eMudhra** subordinate CA revocation policy, Symantec, WoSign, and StartCom blocklists.
2. **Fermat Factorization Sieve on RSA Moduli:**
   - Evaluates whether $|p - q| < 2^{n/4}$ for RSA public keys, identifying keys vulnerable to rapid Fermat factorization (ROCA / close-prime vulnerabilities).
3. **Mandatory Security Disclaimer:**
   - The analysis explicitly disclaims that a valid TLS certificate guarantees only encrypted transport and domain control, **not** organizational legitimacy or absence of fraud. TrustLens never claims to detect internal CA key-generation bugs without mathematical factorization or threat evidence.

---

## 4. 📱 AI-Powered Scam Message Analyzer (Module 3)

Located at `/analyze`, the Scam Message Analyzer deconstructs unstructured SMS, WhatsApp, and Telegram text:
- **Heuristic Urgency Trap:** Identifies artificial time pressure (*"within 2 hours"*, *"account blocked"*).
- **Statutory / KYC Threat Themes:** Detects PAN, Aadhaar, electricity power disconnection coercion.
- **Credential Harvesting Alert:** Triggers critical alerts when OTP, CVV, or passwords are requested.
- **Defanged Indicator Extraction:** Automatically defangs hyperlinks (`hxxps://example[.]com`) and extracts UPI IDs and phone numbers.
- **Guardrail:** The engine explicitly avoids classifying messages as fraudulent solely based on urgent language.

---

## 5. ⛓️ Web3 Report Registry & Tamper-Evident Proof (Module 6)

### Contract Specification
- **Contract Name:** `TrustLensRegistry.sol`
- **Network:** Ethereum Sepolia Testnet (Chain ID: `11155111`)
- **Contract Address:** `0x4b791449348d61B4f80FaA2B99a6111f1E8b6e6F`
- **Local Hardhat Fallback:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Cryptographic Parity & RFC 8785 Canonicalization
TrustLens implements 100% bit-for-bit parity between Python (`common/canonical_json.py`), TypeScript (`frontend/src/lib/web3/canonicalJson.ts`), and the EVM:
1. Volatile post-hash fields (`tx_hash`, `on_chain_registration`, `report_hash`) are stripped.
2. Keys are lexicographically sorted.
3. Whitespace is stripped according to RFC 8785.
4. Serialized bytes are hashed using Ethereum standard `keccak256`.

### Zero-PII Privacy Invariant
Raw URLs, submitted scam messages, IP addresses, and user identifiers are **never** committed on-chain. Only the 32-byte Keccak-256 hash is permanently registered.

---

## 6. 🛡️ Section 9 Security & Privacy Guardrails

1. **SSRF Filter:**
   - Scheme restricted to `http` and `https`.
   - Hostname resolution rejects loopback (`127.0.0.1`, `localhost`), link-local, private RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`, `metadata.google.internal`).
2. **Input Sanitization:**
   - Accidental leading/trailing quotes (`'`, `"`, `` ` ``) and whitespace are cleanly stripped in both frontend and backend.
   - Missing protocols auto-prepend `https://`.
3. **Defense-in-Depth Prompt Injection Shield:**
   - Untrusted web content and message bodies are packaged in non-executable data envelopes (`services/prompt_guard.py`).
4. **Anti-Hallucination Evidence Validator:**
   - LLM claims must cite validated evidence IDs produced by deterministic engines (`services/evidence_validator.py`).

---

## 7. 🚀 Operational Deployment & Cold-Start Runbook

### Service Topography
- **Vercel:** Next.js 14 Frontend. Configured with 60s timeout and graceful fallback to deterministic simulated analysis during cold starts.
- **Render:** Dockerized FastAPI Gateway (`trustlens-api-gateway`) and Rust Security Engine.
- **Docker Compose (Local):** `docker compose up --build` launches all 5 microservices.

### Key Environment Variables
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x4b791449348d61B4f80FaA2B99a6111f1E8b6e6F
NEXT_PUBLIC_SEPOLIA_RPC=https://ethereum-sepolia.publicnode.com

# Gateway (.env)
SECURITY_ENGINE_URL=http://rust_security:8001/api/v1/security/analyze
RENDER_ML_URL=https://hackmatrix-adamas.onrender.com/predict
DATABASE_URL=postgresql://trustlens:hackathon2026@postgres:5432/trustlensdb
```
