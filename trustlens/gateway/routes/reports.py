from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import ThreatReport
from schemas import ReportRequest
from threat_intelligence.models import ThreatReport, ThreatVote

router = APIRouter()


@router.post("/report")
def submit_report(data: ReportRequest, db: Session = Depends(get_db)):

    report = ThreatReport(
        url=str(data.url),
        category=data.category,
        reason=data.reason,
        reported_by=data.reported_by
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "message": "Threat report submitted successfully",
        "report_id": report.id,
        "status": report.status
    }


@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):

    return db.query(ThreatReport).order_by(
        ThreatReport.id.desc()
    ).all()
