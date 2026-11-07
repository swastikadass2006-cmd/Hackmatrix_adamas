import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import home, health
from database import SessionLocal, engine, Base
import models
Base.metadata.create_all(bind=engine)

from schemas import ScanRequest, ReportRequest
from routes.scan import execute_scan
from routes.export import export_stix_2_1
from routes.reports import submit_report
from routes.voting import submit_vote, VoteRequest
from services.trust_score import calculate_trust_score
from services.ssrf_guard import validate_url_safety
from fastapi import HTTPException


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


def test_home_and_health():
    root = home()
    assert root["status"] == "Online"
    assert "version" in root

    h = health()
    assert h["status"] == "healthy"


def test_ssrf_blocking():
    # Loopback IP
    with pytest.raises(HTTPException) as exc_info:
        validate_url_safety("http://127.0.0.1/admin")
    assert exc_info.value.status_code == 400

    # Private RFC1918 IP
    with pytest.raises(HTTPException) as exc_info:
        validate_url_safety("http://192.168.1.1/router")
    assert exc_info.value.status_code == 400

    # Localhost
    with pytest.raises(HTTPException) as exc_info:
        validate_url_safety("http://localhost:8000/api")
    assert exc_info.value.status_code == 400

    # Invalid scheme
    with pytest.raises(HTTPException) as exc_info:
        validate_url_safety("file:///etc/passwd")
    assert exc_info.value.status_code == 400


def test_emudhra_distrusted_ca_hard_override():
    """
    Requirements: A chain containing a flagged intermediate (eMudhra)
    MUST return a high-risk verdict through the hard override (score <= 18, verdict == malicious).
    """
    evidence = [
        {
            "signal": "Distrusted Certificate Authority",
            "severity": "critical",
            "explanation": "Certificate issued by eMudhra Sub-CA 2024 (Class 3). CCADB distrust flag.",
        }
    ]
    score, verdict, override_active, override_reason = calculate_trust_score(
        phishing_risk=10,
        cert_risk=95,
        hygiene_risk=10,
        community_risk=10,
        evidence=evidence,
    )
    assert override_active is True
    assert score <= 18
    assert verdict == "malicious"
    assert "eMudhra" in override_reason or "distrusted" in override_reason.lower()


def test_benign_urls_scan(db):
    benign_targets = [
        "https://github.com",
        "https://google.com",
        "https://python.org",
    ]
    for url in benign_targets:
        data = execute_scan(url, db)
        assert data["trust_score"] >= 75
        assert data["verdict"] == "safe"
        assert "explanation" in data


def test_phishing_urls_scan(db):
    phishing_targets = [
        "https://onlinesbi-kyc-pan-update.top/login.php",
        "https://hdfcbank-netbanking-alert.xyz/verify",
        "https://myaadhaar-update-card.click/download",
    ]
    for url in phishing_targets:
        data = execute_scan(url, db)
        assert data["trust_score"] <= 35
        assert data["verdict"] == "malicious"
        assert len(data["evidence"]) > 0


def test_stix_export(db):
    import json
    res = export_stix_2_1(db)
    bundle = json.loads(res.body.decode())
    assert bundle["type"] == "bundle"
    assert bundle["spec_version"] == "2.1"
    assert "objects" in bundle


def test_voting_deduplication(db):
    # 1. Submit report
    rep = submit_report(
        ReportRequest(
            url="https://fake-sbi-portal.top",
            category="phishing",
            reason="Credential harvesting clone",
            reported_by="alice@security.org",
        ),
        db,
    )
    report_id = rep["report_id"]

    # 2. Reporter voting on their own report should be rejected (HTTP 400)
    with pytest.raises(HTTPException) as exc1:
        submit_vote(report_id, VoteRequest(voter="alice@security.org", vote="confirm"), db)
    assert exc1.value.status_code == 400

    # 3. Third-party vote succeeds
    v1 = submit_vote(report_id, VoteRequest(voter="bob@security.org", vote="confirm"), db)
    assert v1["message"] == "Vote submitted successfully"

    # 4. Duplicate vote by same voter should be rejected (HTTP 409)
    with pytest.raises(HTTPException) as exc2:
        submit_vote(report_id, VoteRequest(voter="bob@security.org", vote="confirm"), db)
    assert exc2.value.status_code == 409
