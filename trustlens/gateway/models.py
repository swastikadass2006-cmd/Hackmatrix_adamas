from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, UniqueConstraint
from datetime import datetime
from database import Base

class ScanRecord(Base):
    __tablename__ = "scans"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String, index=True)
    status = Column(String)  # complete, partial, failed
    overall_verdict = Column(String) # safe, suspicious, malicious
    timestamp = Column(DateTime, default=datetime.utcnow)
    engine_payload = Column(JSON)

# Alias ScanResult to ScanRecord so export.py imports successfully
ScanResult = ScanRecord

class ThreatReport(Base):
    __tablename__ = "threat_reports"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True, nullable=False)
    ip_address = Column(String, index=True, nullable=True)
    category = Column(String)
    reason = Column(String)
    reporter_id = Column(String)
    status = Column(String, default="pending")
    timestamp = Column(DateTime, default=datetime.utcnow)

class ThreatVote(Base):
    __tablename__ = "threat_votes"
    __table_args__ = (
        UniqueConstraint("report_id", "voter", name="unique_report_voter"),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("threat_reports.id"), nullable=False)
    voter = Column(String, nullable=False)
    vote = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
