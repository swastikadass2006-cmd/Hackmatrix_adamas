import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from services.prompt_guard import prepare_untrusted_text
from services.evidence_validator import EvidenceValidator
from threat_intelligence.threat_lookup import check_domain

router = APIRouter()


class AnalyzeRequest(BaseModel):
    text: Optional[str] = None
    message: Optional[str] = None


def defang_url(url: str) -> str:
    """Defang URL to prevent accidental clicks: https://example.com -> hxxps://example[.]com"""
    subbed = re.sub(r"^https?://", lambda m: "hxxps://" if m.group(0).lower().startswith("https") else "hxxp://", url, flags=re.I)
    return subbed.replace(".", "[.]")


def defang_email(email: str) -> str:
    """Defang email: user@domain.com -> user[at]domain[.]com"""
    return email.replace("@", "[at]").replace(".", "[.]")


def analyze_scam_message_core(raw_text: str) -> Dict[str, Any]:
    """
    Core AI Scam & Message Analyzer complying with Handbook Module 3:
    1. Input sanitized with Prompt Injection Defense Envelope
    2. Extract indicators (URLs, Emails, Phones, UPI IDs) with defanging
    3. Separate suspicious language heuristics ('Signals, not proof') from verified evidence
    4. Invariant: Urgency alone MUST NOT produce a 'fraud' or 'malicious' verdict
    5. Evidence validation with structured finding IDs
    """
    # 1. Prompt Injection Defense Shield
    prepared = prepare_untrusted_text(raw_text)
    sanitized_text = prepared["content"]

    # Check for direct prompt injection attacks
    injection_patterns = [
        r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
        r"system\s*prompt\s*override",
        r"mark\s+this\s+(message|site|content)\s+as\s+safe",
        r"you\s+are\s+now\s+in\s+developer\s+mode",
    ]
    prompt_injection_detected = any(re.search(p, sanitized_text, re.I) for p in injection_patterns)

    indicators: List[Dict[str, str]] = []
    language_signals: List[Dict[str, Any]] = []
    verified_evidence: List[Dict[str, Any]] = []

    if prompt_injection_detected:
        verified_evidence.append({
            "id": "SCAM-PROMPT-INJECTION",
            "signal": "Adversarial Prompt Injection Attempt Detected",
            "severity": "high",
            "explanation": "Message body attempts to manipulate AI assessment via instruction override patterns. Verdict locked.",
            "source": "prompt_injection_shield",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    # 2. Extract URLs
    url_regex = r"(https?://[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|in|org|net|top|xyz|biz|live|info|club|site|app|click)(?:/[^\s]*)?)"
    urls_found = re.findall(url_regex, sanitized_text, re.I)
    unique_urls = list(dict.fromkeys(urls_found))

    for u in unique_urls:
        defanged = defang_url(u)
        indicators.append({
            "type": "url",
            "raw": u,
            "defanged": defanged,
            "category": "Target Hyperlink"
        })

        lower_u = u.lower()
        # Brand lookalike detection on extracted URLs
        brand_terms = ["sbi", "hdfc", "icici", "pan", "kyc", "aadhaar", "incometax", "yono"]
        if any(b in lower_u for b in brand_terms) and not any(legit in lower_u for legit in ["sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com", "incometax.gov.in"]):
            verified_evidence.append({
                "id": f"SCAM-URL-BRAND-{len(verified_evidence)+1}",
                "signal": "Brand Impersonation in Link",
                "severity": "critical",
                "explanation": f"Extracted link ({defanged}) mimics official banking/government identity on an untrusted host.",
                "source": "brand_watchlist",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

        # Disposable / Abused TLDs
        abused_tlds = [".top", ".xyz", ".click", ".live", ".biz", ".work"]
        if any(lower_u.endswith(tld) or f"{tld}/" in lower_u for tld in abused_tlds):
            verified_evidence.append({
                "id": f"SCAM-URL-TLD-{len(verified_evidence)+1}",
                "signal": "Low-Reputation TLD Link",
                "severity": "high",
                "explanation": f"Link uses top-level domain frequently associated with spam and credential harvesting: {defanged}",
                "source": "lexical_model",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

        # Check local threat database for domain hit
        try:
            intel = check_domain(u)
            if intel.get("found"):
                verified_evidence.append({
                    "id": f"SCAM-URL-INTEL-{len(verified_evidence)+1}",
                    "signal": f"Threat Database Hit ({intel.get('threat_type')})",
                    "severity": "critical",
                    "explanation": f"Extracted domain listed in threat intelligence dataset: {intel.get('source')}",
                    "source": "threat_intel_database",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
        except Exception:
            pass

    # 3. Extract UPI IDs
    upi_regex = r"[a-zA-Z0-9._-]+@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|apl|upi|freecharge|axl|ibl)"
    upis_found = re.findall(upi_regex, sanitized_text, re.I)
    # Find full matches
    full_upis = [m.group(0) for m in re.finditer(r"[a-zA-Z0-9._-]+@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|apl|upi|freecharge|axl|ibl)", sanitized_text, re.I)]
    for upi in list(dict.fromkeys(full_upis)):
        indicators.append({
            "type": "upi",
            "raw": upi,
            "defanged": upi.replace("@", "[@]"),
            "category": "Unified Payments Interface (UPI)"
        })
        verified_evidence.append({
            "id": f"SCAM-UPI-EXTRACTED-{len(verified_evidence)+1}",
            "signal": "Unverified Payment Destination in Message",
            "severity": "high",
            "explanation": f"Direct payment requested to personal/merchant UPI VPA: {upi.replace('@', '[@]')}",
            "source": "payment_linter",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    # 4. Extract Phone Numbers
    phone_regex = r"(?:\+91[\s-]?)?[6789]\d{9}|1800[\s-]?\d{3}[\s-]?\d{3,4}"
    phones = re.findall(phone_regex, sanitized_text)
    for phone in list(dict.fromkeys(phones)):
        clean_p = phone.strip()
        indicators.append({
            "type": "phone",
            "raw": clean_p,
            "defanged": clean_p[:3] + "***" + clean_p[-3:] if len(clean_p) >= 6 else clean_p,
            "category": "Origin Contact Number"
        })

    # 5. Extract Emails
    email_regex = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    emails = re.findall(email_regex, sanitized_text)
    for em in list(dict.fromkeys(emails)):
        if not any(em.lower() == u.lower() for u in full_upis):
            indicators.append({
                "type": "email",
                "raw": em,
                "defanged": defang_email(em),
                "category": "Contact Mailbox"
            })

    # 6. Heuristic Linguistic Signals ("Signals, not proof")
    text_lower = sanitized_text.lower()

    # Rule: Check if message is a genuine security advisory ("do not share", "never share otp", "bank never asks")
    is_legitimate_security_notice = bool(re.search(
        r"(do\s+not\s+share|never\s+share\s+(your\s+)?otp|bank\s+never\s+asks|keep\s+it\s+confidential)",
        text_lower
    ))

    # A. Urgency & Coercion
    urgency_match = re.search(r"(immediately|within\s+\d+\s+hours?|urgent|account\s+suspended|deactivated\s+today|last\s+warning|blocked|power\s+will\s+be\s+disconnected|service\s+stopped)", text_lower)
    if urgency_match:
        language_signals.append({
            "id": "SCAM-LANG-URGENCY",
            "pattern": "Time Pressure & Coercive Urgency",
            "category": "Urgency & Coercion",
            "snippet": urgency_match.group(0),
            "severity": "medium",
            "explanation": "Message uses artificial time pressure to prompt hasty action without verification.",
            "source": "linguistic_heuristic"
        })

    # B. Statutory & KYC Threat Theme
    kyc_match = re.search(r"(kyc\s+pending|update\s+pan|pan\s+card|electricity\s+bill\s+not\s+updated|aadhaar\s+update|biometric\s+lock)", text_lower)
    if kyc_match:
        language_signals.append({
            "id": "SCAM-LANG-KYC",
            "pattern": "Statutory / KYC Coercion Theme",
            "category": "KYC & Account Threats",
            "snippet": kyc_match.group(0),
            "severity": "high",
            "explanation": "Impersonates essential utility or government statutory requirement to induce compliance.",
            "source": "linguistic_heuristic"
        })

    # C. Financial Reward & Lures
    reward_match = re.search(r"(lottery|won\s+rs|reward\s+of|cashback\s+credited|income\s+tax\s+refund\s+approved|crypto\s+gift|congratulations\s+winner|work\s+from\s+home\s+daily\s+payout)", text_lower)
    if reward_match:
        language_signals.append({
            "id": "SCAM-LANG-REWARD",
            "pattern": "Financial Lure & Unsolicited Reward",
            "category": "Financial & Reward Hooks",
            "snippet": reward_match.group(0),
            "severity": "medium",
            "explanation": "Unsolicited monetary incentive or prize lure commonly used in task scams.",
            "source": "linguistic_heuristic"
        })

    # D. Credential & OTP Exfiltration Requests
    # Only flag as credential harvesting if asking to SHARE or SEND credentials, NOT genuine "do not share" notices
    if re.search(r"(share\s+otp|send\s+(the\s+)?\d+-digit|enter\s+debit\s+card|send\s+cvv|submit\s+netbanking\s+password)", text_lower):
        verified_evidence.append({
            "id": "SCAM-CRED-HARVEST",
            "signal": "Active Credential or OTP Exfiltration Request",
            "severity": "critical",
            "explanation": "Message explicitly requests the recipient to share authentication factors (OTP/PIN/Password).",
            "source": "credential_linter",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    elif is_legitimate_security_notice and not any(e["severity"] == "critical" for e in verified_evidence):
        language_signals.append({
            "id": "SCAM-LANG-ADVISORY",
            "pattern": "Legitimate Security Disclaimer Notice",
            "category": "Security Education",
            "snippet": "do not share OTP",
            "severity": "low",
            "explanation": "Contains standard bank security advice advising against credential sharing.",
            "source": "linguistic_heuristic"
        })

    # 7. Five-Class Risk Determination
    # Invariant: Urgency alone MUST NOT yield 'Confirmed Malicious' or 'High Risk'.
    has_critical_evidence = any(e.get("severity") == "critical" for e in verified_evidence)
    has_high_evidence = any(e.get("severity") == "high" for e in verified_evidence)
    has_high_language = any(s.get("severity") == "high" for s in language_signals)

    if has_critical_evidence:
        classification = "Confirmed Malicious"
        risk_score = 92
        verdict = "malicious"
        recommendation = "CRITICAL RISK: Active credential harvesting or malicious infrastructure detected. Do NOT click links or communicate."
    elif has_high_evidence or (has_high_language and len(indicators) > 0 and not is_legitimate_security_notice):
        classification = "High Risk"
        risk_score = 75
        verdict = "malicious"
        recommendation = "HIGH RISK: Strong social engineering indicators combined with unverified links/contacts. Verify independently."
    elif len(language_signals) > 0 or len(indicators) > 0:
        classification = "Suspicious"
        risk_score = 45 if not is_legitimate_security_notice else 20
        verdict = "suspicious"
        recommendation = (
            "GENUINE ADVISORY / LOW RISK: Message appears to be a standard alert or contains urgency heuristics. "
            "Absence of malicious indicators is not proof of safety. Always verify directly through official apps."
            if is_legitimate_security_notice else
            "SUSPICIOUS: Contains persuasive or urgent language. Treat unverified contact details with caution."
        )
    else:
        classification = "No indicators found"
        risk_score = 10
        verdict = "safe"
        recommendation = "No suspicious linguistic patterns or weaponized indicators detected. Note: Absence of indicators is not proof of safety."

    # Validate claims for anti-hallucination compliance
    all_findings = verified_evidence + language_signals
    raw_claims = [{"text": f.get("explanation", ""), "evidence_id": f.get("id", "SCAM-001")} for f in all_findings]
    validated_claims = EvidenceValidator.validate_llm_explanation(raw_claims, all_findings)

    return {
        "classification": classification,
        "verdict": verdict,
        "risk_score": risk_score,
        "trust_score": 100 - risk_score,
        "indicators": indicators,
        "language_signals": language_signals,
        "verified_evidence": verified_evidence,
        "validated_claims": validated_claims,
        "recommendation": recommendation,
        "disclaimer": (
            "Linguistic heuristics highlight common persuasion themes ('signals, not proof'). "
            "A message is never labeled fraudulent solely due to urgent language. Always verify "
            "claims through official bank or utility portals."
        ),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.post("/analyze")
@router.post("/api/v1/analyze")
def analyze_message(data: AnalyzeRequest):
    content = data.text or data.message
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Please provide a message or communication text to analyze.")
    return analyze_scam_message_core(content)
