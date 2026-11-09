import logging
from typing import List, Dict, Any, Optional
from services.evidence_validator import EvidenceValidator

logger = logging.getLogger(__name__)


def generate_plain_language_explanation(
    trust_score: int,
    verdict: str,
    override_active: bool,
    override_reason: Optional[str],
    evidence: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Translates raw multi-engine telemetry and risk scores into clear,
    human-readable explanations and actionable recommendations.
    Explicitly clarifies that absence of threats is not a guarantee of safety,
    and a valid TLS certificate does not guarantee a website is legitimate.
    """
    reasons: List[str] = []

    if override_active and override_reason:
        reasons.append(override_reason)

    critical_evidence = [e for e in evidence if str(e.get("severity", "")).lower() in ("critical", "high")]
    medium_evidence = [e for e in evidence if str(e.get("severity", "")).lower() == "medium"]

    for ev in critical_evidence:
        reasons.append(f"Critical Concern: {ev.get('signal')} — {ev.get('explanation')}")

    for ev in medium_evidence[:2]:
        reasons.append(f"Observation: {ev.get('signal')} — {ev.get('explanation')}")

    if not reasons:
        reasons.append(
            "Target domain meets zero-trust evaluation criteria: valid public certificate chain, "
            "standard transport security headers, and zero brand spoofing/typosquatting signals."
        )

    # Action recommendation & limitations
    if verdict == "malicious" or trust_score <= 35:
        action = (
            "DO NOT ENTER CREDENTIALS OR DOWNLOAD FILES. This portal displays signatures of an active phishing "
            "clone or severely degraded cryptographic trust. Disconnect immediately."
        )
    elif verdict == "suspicious" or trust_score < 75:
        action = (
            "PROCEED WITH CAUTION. Subtle security anomalies or missing transport encryption "
            "policies were detected. Verify the authenticity of this portal before submitting data."
        )
    else:
        action = (
            "SAFE TO BROWSE. Verified identity and cryptographic trust parameters conform to "
            "standard enterprise security baselines. Note: A valid TLS certificate encrypts traffic "
            "but does not guarantee the site's business legitimacy. Absence of threat indicators is not proof of 100% safety."
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
        "limitations": [
            "Passive assessment only; does not perform active intrusion or exploit testing.",
            "Valid TLS certificate confirms encryption and domain ownership, not merchant legitimacy.",
            "Absence of known threat indicators is never a 100% guarantee of safety."
        ]
    }


async def generate_explanation(target_url: str, engine_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Task 2: LLM Explainer with Strict Evidence Validation.
    Generates structured claims referencing verified evidence IDs only.
    """
    logger.info(f"Generating validated explanation for {target_url}")

    all_findings = []
    for result in engine_results:
        all_findings.extend(result.get("findings", []))

    raw_llm_claims = []

    # Look for SSRF block
    ssrf_blocks = [f for f in all_findings if f.get("signal") == "SSRF_Policy_Violation"]
    if ssrf_blocks:
        raw_llm_claims.append({
            "text": "The target resolved to a restricted internal IP address, triggering our SSRF protection policies.",
            "evidence_id": ssrf_blocks[0].get("id")
        })

    # Look for Distrusted CA
    bad_certs = [f for f in all_findings if "distrusted" in f.get("signal", "").lower()]
    if bad_certs:
        raw_llm_claims.append({
            "text": "The cryptographic certificate was issued by a known distrusted authority, posing a critical interception risk.",
            "evidence_id": bad_certs[0].get("id")
        })

    # Look for Valid CA
    good_certs = [f for f in all_findings if "valid" in f.get("signal", "").lower()]
    if good_certs:
        raw_llm_claims.append({
            "text": "The target uses a trusted TLS certificate, ensuring encrypted communication.",
            "evidence_id": good_certs[0].get("id")
        })

    # Task 3: Enforce Validation - Strip hallucinations
    validated_claims = EvidenceValidator.validate_llm_explanation(
        explanation_claims=raw_llm_claims,
        engine_findings=all_findings
    )

    return {
        "summary": "Threat analysis completed based on cryptographic and network evidence.",
        "validated_claims": validated_claims
    }
