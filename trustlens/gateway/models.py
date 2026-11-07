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


from sqlalchemy import ForeignKey, UniqueConstraint


class ThreatVote(Base):
    __tablename__ = "threat_votes"

    id = Column(Integer, primary_key=True, index=True)

    report_id = Column(
        Integer,
        ForeignKey("threat_reports.id"),
        nullable=False
    )

    voter = Column(String, nullable=False)

    vote = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint(
            "report_id",
            "voter",
            name="unique_report_voter"
        ),
    )
