from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from urllib.parse import urlparse

from database import get_db
from models import ScanResult, ThreatReport
from schemas import ScanRequest
from services.ssrf_guard import validate_url_safety
from services.phishing_detector import detector as phishing_detector
from services.engine_connector import analyze_security_sync
from services.trust_score import calculate_trust_score
from services.explainer import generate_plain_language_explanation

router = APIRouter()


def execute_scan(url_input: str, db: Session) -> dict:
    url = str(url_input).strip()

    # 1. SSRF Protection & Scheme Validation
    validate_url_safety(url)

    # 2. Layer 1: In-process Phishing ML & Lexical Analysis
    phishing_result = phishing_detector.analyze_url(url)
    phishing_risk = phishing_result.get("risk", 0)

    # 3. Layer 2 & 3: X.509 Certificate Chain, CT Logs, & Web Hygiene (Rust Engine / Fallback)
    security_data = analyze_security_sync(url)
    security_results = security_data.get("results", [])

    cert_risk = 0
    hygiene_risk = 0
    security_evidence = []

    for res in security_results:
        eng = res.get("engine_name")
        risk = res.get("risk_score", 0)
        evs = res.get("evidence", [])
        security_evidence.extend(evs)

        if eng in ("TrustChain", "CTMonitor"):
            cert_risk = max(cert_risk, risk)
        elif eng == "WebHygiene":
            hygiene_risk = max(hygiene_risk, risk)

    # 4. Layer 4: Community Threat Intel & Report History
    parsed_host = urlparse(url).hostname or url
    community_reports_count = (
        db.query(ThreatReport).filter(ThreatReport.url.contains(parsed_host)).count()
    )
    community_risk = min(100, community_reports_count * 25)

    community_evidence = []
    if community_reports_count > 0:
        community_evidence.append({
            "signal": "Community Blacklist Hits",
            "severity": "high" if community_reports_count >= 2 else "medium",
            "explanation": f"Domain was submitted in {community_reports_count} verified community threat reports.",
        })

    # Combine all evidence
    all_evidence = phishing_result.get("evidence", []) + security_evidence + community_evidence

    # 5. Fusion Layer with Hard Overrides
    score, verdict, override_active, override_reason = calculate_trust_score(
        phishing_risk=phishing_risk,
        cert_risk=cert_risk,
        hygiene_risk=hygiene_risk,
        community_risk=community_risk,
        evidence=all_evidence,
    )

    # 6. Plain-Language Explainability
    explanation = generate_plain_language_explanation(
        trust_score=score,
        verdict=verdict,
        override_active=override_active,
        override_reason=override_reason,
        evidence=all_evidence,
    )

    # 7. Persist to Database
    result_record = ScanResult(
        url=url,
        trust_score=score,
        verdict=verdict,
    )
    db.add(result_record)
    db.commit()
    db.refresh(result_record)

    return {
        "scan_id": result_record.id,
        "url": url,
        "trust_score": score,
        "verdict": verdict,
        "override_active": override_active,
        "override_reason": override_reason,
        "layers": {
            "phishing": {"risk": phishing_risk, "score": 100 - phishing_risk},
            "certificate": {"risk": cert_risk, "score": 100 - cert_risk},
            "hygiene": {"risk": hygiene_risk, "score": 100 - hygiene_risk},
            "community": {"risk": community_risk, "score": 100 - community_risk},
        },
        "explanation": explanation,
        "evidence": all_evidence,
    }


@router.post("/scan")
def scan_url(data: ScanRequest, db: Session = Depends(get_db)):
    return execute_scan(data.url, db)


@router.get("/scans")
def get_scans(db: Session = Depends(get_db)):
    return db.query(ScanResult).order_by(ScanResult.id.desc()).all()


@router.get("/scan/{scan_id}")
def get_scan_by_id(scan_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan result not found.")
    return record
