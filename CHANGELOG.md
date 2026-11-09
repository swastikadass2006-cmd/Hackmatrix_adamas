# Changelog

All notable changes to the TrustLens project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-09

### Added
- **Scam Message Analyzer API (`POST /api/v1/analyze` and `POST /analyze`)**: High-throughput service parsing SMS, WhatsApp, and email alerts with defanged extraction of URLs, UPI IDs, phone numbers, and emails.
- **Telegram Cyber-Threat Bot (`trustlens/bot`)**: Automated community triage bot supporting `/start`, `/scan <url>`, `/analyze <text>`, and `/verify <0xhash>`.
- **RFC 8785 Canonicalization & Keccak-256 in Rust Security Engine**: Implemented `trustlens/engines/security_engine/src/canonical.rs` with `POST /canonicalize` endpoint.
- **Cross-Language Canonical Conformance Tests**: Bit-for-bit test vectors across Rust, Python Gateway, and TypeScript Frontend Verifier.
- **Multi-Hop Redirect & DNS Fast-Flux Tracer**: Traces HTTP 301/302 redirects with per-hop SSRF validation and detects multi-IP fast-flux DNS configurations.
- **Embedded Threat Graph Manager**: Direct graph entity correlation linking domains, resolved IPs, and malicious campaigns.
- **Automated QA & Latency Benchmarking Suite**: `tests/cases.yaml`, `tests/run_suite.py` (40 ground-truth cases, 100% pass rate), and `tests/benchmark_latency.py`.
- **Documentation Suite**: `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/TESTING_REPORT.md`, `docs/HANDBOOK_COMPLIANCE.md`.

### Fixed
- **Risk Classification Taxonomy**: Replaced prohibited `"Safe"` and `"Verified Safe"` verdicts with handbook-compliant `"No indicators found"`, ensuring absence of threats is never presented as an absolute guarantee of safety.
- **Brand Lookalike Self-Impersonation**: Fixed `BRAND_TARGETS` validation to prevent authentic banking portals (`onlinesbi.sbi`, `hdfcbank.com`, `uidai.gov.in`) from being flagged as spoofing themselves.
- **False-Positive ML Override Suppression**: Shielded clean apex domains from remote XGBoost `dot_count` false positives unless corroborated by lexical or threat intel evidence.
- **Legitimate Security Advisory False Alarms**: Added contextual negative lookbehinds preventing bank 2FA notices (*"Do not share your OTP"*) from triggering credential exfiltration alarms.
- **CORS Hardening**: Enforced explicit origins and Vercel preview domain regex matching on the Gateway.
- **Smart Contract Toolchain**: Converted Hardhat scripts to ES module syntax with independent ethers.js v6 deployment scripts (`scripts/deploy_sepolia.sh`).

### Security
- **Strict SSRF Boundary Protection**: Hardened against IPv4, IPv6, octal, decimal, hexadecimal loopbacks, and cloud metadata services.
- **Adversarial Prompt Injection Shield**: Sanitized input envelopes to prevent malicious prompts from altering risk verdicts.
- **Zero-PII On-Chain Policy**: Enforced 32-byte Keccak-256 hash storage on Ethereum Sepolia testnet with zero sensitive data leakage.
