from typing import Tuple, Optional, List, Dict, Any


def calculate_trust_score(
    phishing_risk: int,
    cert_risk: int,
    hygiene_risk: int,
    community_risk: int,
    evidence: Optional[List[Dict[str, Any]]] = None,
) -> Tuple[int, str, bool, Optional[str]]:
    """
    TrustLens Risk Fusion Engine
    Calculates 0-100 Digital Trust Score with deterministic Hard Overrides:
    - Distrusted Intermediate CA (eMudhra incident) forces score <= 18
    - Weak Cryptographic Key (RSA < 2048 / Fermat) forces score <= 20
    - Phishing Credential Clone forces score <= 10
    """
    # 1. Base Weighted Score (0 to 100)
    weighted_risk = (
        0.40 * phishing_risk +
        0.25 * cert_risk +
        0.15 * hygiene_risk +
        0.20 * community_risk
    )

    base_score = max(0, min(100, round(100 - weighted_risk)))
    final_score = base_score
    override_active = False
    override_reason: Optional[str] = None

    evidence_signals = [e.get("signal", "") for e in (evidence or [])]

    # 2. Hard Overrides Evaluation
    # Rule A: Distrusted CA Hierarchy
    is_ca_distrusted = cert_risk >= 90 or any(
        "distrusted" in s.lower() for s in evidence_signals
    )
    if is_ca_distrusted:
        override_active = True
        override_reason = (
            "HARD OVERRIDE: Certificate issued by untrusted/distrusted CA "
            "(violates CCADB baseline policy, e.g. eMudhra subordinate revocation)."
        )
        final_score = min(final_score, 18)

    # Rule B: Weak Cryptographic Key
    is_weak_key = any("weak" in s.lower() and "key" in s.lower() for s in evidence_signals)
    if is_weak_key and not override_active:
        override_active = True
        override_reason = (
            "HARD OVERRIDE: Cryptographic key length is below 2048 bits or susceptible to Fermat factorization."
        )
        final_score = min(final_score, 20)

    # Rule C: Critical Phishing Credential Impersonation
    if phishing_risk >= 85 and not override_active:
        override_active = True
        override_reason = (
            "HARD OVERRIDE: Confirmed brand lookalike impersonation targeting critical digital banking/identity portal."
        )
        final_score = min(final_score, 10)

    # 3. Verdict Assignment
    if final_score >= 75:
        verdict = "safe"
    elif final_score >= 40:
        verdict = "suspicious"
    else:
        verdict = "malicious"

    return final_score, verdict, override_active, override_reason
