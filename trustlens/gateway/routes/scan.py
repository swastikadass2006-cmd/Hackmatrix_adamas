from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import ScanResult
from schemas import ScanRequest
from services.trust_score import calculate_trust_score

router = APIRouter()


@router.post("/scan")
def scan_url(data: ScanRequest, db: Session = Depends(get_db)):

    url = str(data.url)

    # Temporary demo values
    phishing_risk = 50
    cert_risk = 30
    hygiene_risk = 20
    community_risk = 40

    score, verdict = calculate_trust_score(
        phishing_risk,
        cert_risk,
        hygiene_risk,
        community_risk
    )

    result = ScanResult(
        url=url,
        trust_score=score,
        verdict=verdict
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "scan_id": result.id,
        "url": url,
        "trust_score": score,
        "verdict": verdict,
        "evidence": [
            {
                "signal": "Phishing Detection",
                "severity": "medium",
                "explanation": "Waiting for integration with Member 1's engine."
            },
            {
                "signal": "Certificate Check",
                "severity": "low",
                "explanation": "Waiting for integration with Member 2's engine."
            }
        ]
    }


@router.get("/scans")
def get_scans(db: Session = Depends(get_db)):

    return db.query(ScanResult).order_by(
        ScanResult.id.desc()
    ).all()