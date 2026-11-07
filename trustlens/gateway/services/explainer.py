from typing import List, Dict, Any, Optional


def generate_plain_language_explanation(
    trust_score: int,
    verdict: str,
    override_active: bool,
    override_reason: Optional[str],
    evidence: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Translates raw multi-engine telemetry and risk scores into clear,
    human-readable explanations and action recommendations.
    """
    reasons: List[str] = []

    if override_active and override_reason:
        reasons.append(override_reason)

    critical_evidence = [e for e in evidence if e.get("severity") in ("critical", "high")]
    medium_evidence = [e for e in evidence if e.get("severity") == "medium"]

    for ev in critical_evidence:
        reasons.append(f"Critical Concern: {ev.get('signal')} — {ev.get('explanation')}")

    for ev in medium_evidence[:2]:
        reasons.append(f"Observation: {ev.get('signal')} — {ev.get('explanation')}")

    if not reasons:
        reasons.append(
            "Target domain meets all zero-trust criteria: valid public certificate chain, "
            "standard security transport headers, and no brand spoofing indicators."
        )

    # Action recommendation
    if verdict == "malicious":
        action = (
            "DO NOT ENTER CREDENTIALS. This portal displays signatures of an active phishing "
            "clone or severely degraded cryptographic trust. Disconnect immediately."
        )
    elif verdict == "suspicious":
        action = (
            "PROCEED WITH CAUTION. Subtle security anomalies or missing transport encryption "
            "policies were detected. Verify the authenticity of this portal before submitting data."
        )
    else:
        action = (
            "SAFE TO BROWSE. Verified identity and cryptographic trust parameters conform to "
            "standard enterprise security baselines."
        )

    summary_headline = (
        f"Score {trust_score}/100 [{verdict.upper()}]: "
        + (f"Hard override enforced. " if override_active else "")
        + f"{len(critical_evidence)} high-risk flags identified."
    )

    return {
        "headline": summary_headline,
        "reasons": reasons,
        "recommended_action": action,
    }
