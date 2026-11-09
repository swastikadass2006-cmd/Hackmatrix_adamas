from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.ext.hybrid import hybrid_property
from database import Base


class ScanRecord(Base):
    __tablename__ = "scans"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String, index=True, nullable=True)
    url = Column(String, index=True, nullable=True)
    status = Column(String, default="complete")  # complete, partial, failed
    overall_verdict = Column(String, nullable=True)  # safe, suspicious, malicious
    verdict = Column(String, nullable=True)
    trust_score = Column(Integer, default=50)
    timestamp = Column(DateTime, default=datetime.utcnow)
    scan_date = Column(DateTime, default=datetime.utcnow)
    engine_payload = Column(JSON, nullable=True)

    def __init__(self, **kwargs):
        # Sync url and target_url
        if "url" in kwargs and "target_url" not in kwargs:
            kwargs["target_url"] = kwargs["url"]
        elif "target_url" in kwargs and "url" not in kwargs:
            kwargs["url"] = kwargs["target_url"]

        # Sync verdict and overall_verdict
        if "verdict" in kwargs and "overall_verdict" not in kwargs:
            kwargs["overall_verdict"] = kwargs["verdict"]
        elif "overall_verdict" in kwargs and "verdict" not in kwargs:
            kwargs["verdict"] = kwargs["overall_verdict"]

        if "timestamp" in kwargs and "scan_date" not in kwargs:
            kwargs["scan_date"] = kwargs["timestamp"]
        elif "scan_date" in kwargs and "timestamp" not in kwargs:
            kwargs["timestamp"] = kwargs["scan_date"]

        super().__init__(**kwargs)


# Alias ScanResult to ScanRecord
ScanResult = ScanRecord


class ThreatReport(Base):
    __tablename__ = "threat_reports"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=True)
    domain = Column(String, index=True, nullable=True)
    ip_address = Column(String, index=True, nullable=True)
    category = Column(String, nullable=True)
    reason = Column(String, nullable=True)
    reported_by = Column(String, nullable=True)
    reporter_id = Column(String, nullable=True)
    status = Column(String, default="pending")
    timestamp = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        # Sync url and domain
        if "url" in kwargs and "domain" not in kwargs:
            kwargs["domain"] = kwargs["url"]
        elif "domain" in kwargs and "url" not in kwargs:
            kwargs["url"] = kwargs["domain"]

        # Sync reported_by and reporter_id
        if "reported_by" in kwargs and "reporter_id" not in kwargs:
            kwargs["reporter_id"] = kwargs["reported_by"]
        elif "reporter_id" in kwargs and "reported_by" not in kwargs:
            kwargs["reported_by"] = kwargs["reporter_id"]

        if "timestamp" in kwargs and "created_at" not in kwargs:
            kwargs["created_at"] = kwargs["timestamp"]
        elif "created_at" in kwargs and "timestamp" not in kwargs:
            kwargs["timestamp"] = kwargs["created_at"]

        super().__init__(**kwargs)


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
