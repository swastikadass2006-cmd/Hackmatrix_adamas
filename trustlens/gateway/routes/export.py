import csv
import io
import json
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from models import ThreatReport, ScanResult

router = APIRouter()


@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):
    reports = db.query(ThreatReport).all()
    return [
        {
            "id": r.id,
            "url": r.url,
            "category": r.category,
            "reason": r.reason,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    reports = db.query(ThreatReport).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "URL", "Category", "Reason", "Status", "CreatedAt"])

    for r in reports:
        writer.writerow([
            r.id,
            r.url,
            r.category,
            r.reason,
            r.status,
            r.created_at.isoformat() if r.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=threat_reports.csv"},
    )


@router.get("/export/stix")
def export_stix_2_1(db: Session = Depends(get_db)):
    """
    Exports threat reports and malicious scan indicators as a STIX 2.1 JSON Bundle.
    """
    reports = db.query(ThreatReport).all()
    scans = db.query(ScanResult).filter(ScanResult.verdict == "malicious").all()

    stix_objects = []
    bundle_id = f"bundle--{int(datetime.utcnow().timestamp())}"

    # Convert Threat Reports to STIX Indicators
    for r in reports:
        stix_objects.append({
            "type": "indicator",
            "spec_version": "2.1",
            "id": f"indicator--report-{r.id}",
            "created": r.created_at.isoformat() + "Z" if r.created_at else datetime.utcnow().isoformat() + "Z",
            "modified": r.created_at.isoformat() + "Z" if r.created_at else datetime.utcnow().isoformat() + "Z",
            "name": f"Malicious URL Indicator: {r.category or 'Phishing'}",
            "description": f"TrustLens Community Threat Report: {r.reason}",
            "indicator_types": ["malicious-activity"],
            "pattern": f"[url:value = '{r.url}']",
            "pattern_type": "stix",
            "valid_from": r.created_at.isoformat() + "Z" if r.created_at else datetime.utcnow().isoformat() + "Z",
            "confidence": 85,
        })

    # Convert Malicious Scan Results to STIX Indicators
    for s in scans:
        created_str = s.scan_date.isoformat() + "Z" if s.scan_date else datetime.utcnow().isoformat() + "Z"
        stix_objects.append({
            "type": "indicator",
            "spec_version": "2.1",
            "id": f"indicator--scan-{s.id}",
            "created": created_str,
            "modified": created_str,
            "name": f"Automated Scan Malicious Indicator",
            "description": f"TrustLens Digital Trust Score {s.trust_score}/100. Confirmed Malicious.",
            "indicator_types": ["malicious-activity"],
            "pattern": f"[url:value = '{s.url}']",
            "pattern_type": "stix",
            "valid_from": created_str,
            "confidence": 95,
        })

    stix_bundle = {
        "type": "bundle",
        "id": bundle_id,
        "spec_version": "2.1",
        "objects": stix_objects,
    }

    return JSONResponse(
        content=stix_bundle,
        headers={"Content-Disposition": "attachment; filename=trustlens_stix_2_1_bundle.json"},
    )
