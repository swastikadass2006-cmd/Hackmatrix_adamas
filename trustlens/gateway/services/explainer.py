import logging
from typing import Dict, Any, List
from services.evidence_validator import EvidenceValidator

logger = logging.getLogger(__name__)

async def generate_explanation(target_url: str, engine_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Task 2: LLM Explainer.
    Generates a structured explanation where EVERY claim references an evidence ID.
    """
    logger.info(f"Generating validated explanation for {target_url}")

    # Flatten all findings from all engines into a single list
    all_findings = []
    for result in engine_results:
        all_findings.extend(result.get("findings", []))

    # --- MVP Simulation of an LLM generating claims based on the findings ---
    raw_llm_claims = []

    # Look for the SSRF block
    ssrf_blocks = [f for f in all_findings if f.get("signal") == "SSRF_Policy_Violation"]
    if ssrf_blocks:
        raw_llm_claims.append({
            "text": "The target resolved to a restricted internal IP address, triggering our SSRF protection policies.",
            "evidence_id": ssrf_blocks[0].get("id")
        })

    # Look for Distrusted CA
    bad_certs = [f for f in all_findings if f.get("signal") == "Distrusted_Certificate_Authority"]
    if bad_certs:
        raw_llm_claims.append({
            "text": "The cryptographic certificate was issued by a known distrusted authority, posing a critical interception risk.",
            "evidence_id": bad_certs[0].get("id")
        })

    # Look for Valid CA
    good_certs = [f for f in all_findings if f.get("signal") == "Valid_Certificate_Authority"]
    if good_certs:
        raw_llm_claims.append({
            "text": "The target uses a trusted TLS certificate, ensuring encrypted communication.",
            "evidence_id": good_certs[0].get("id")
        })

    # Simulate a hallucination to prove the validator works!
    raw_llm_claims.append({
        "text": "The website contains Russian malware payloads in the HTML body.",
        "evidence_id": "FAKE-AI-ID-999"
    })

    # --- Task 3: Enforce Validation ---
    # Pass the LLM's claims through the Evidence Validator to strip out hallucinations
    validated_claims = EvidenceValidator.validate_llm_explanation(
        explanation_claims=raw_llm_claims,
        engine_findings=all_findings
    )

    return {
        "summary": "Threat analysis completed based on cryptographic and network evidence.",
        "validated_claims": validated_claims
    }
