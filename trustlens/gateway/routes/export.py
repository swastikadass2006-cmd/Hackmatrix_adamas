import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import ThreatReport

router = APIRouter()


@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):

    reports = db.query(ThreatReport).all()

    return [
        {
            "url": r.url,
            "category": r.category,
            "reason": r.reason,
            "status": r.status
        }
        for r in reports
    ]


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):

    reports = db.query(ThreatReport).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "URL", "Category", "Reason", "Status"
    ])

    for r in reports:
        writer.writerow([
            r.url, r.category, r.reason, r.status
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=threat_reports.csv"
        }
    )