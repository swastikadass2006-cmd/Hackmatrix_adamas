from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from database import Base


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    trust_score = Column(Integer)
    verdict = Column(String)
    scan_date = Column(DateTime, default=datetime.utcnow)


class ThreatReport(Base):
    __tablename__ = "threat_reports"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    category = Column(String)
    reason = Column(String)
    reported_by = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)