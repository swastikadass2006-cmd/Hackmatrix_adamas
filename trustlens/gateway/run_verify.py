import json
import sys
import os

sys.stdout.reconfigure(line_buffering=True)
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database import SessionLocal, engine, Base
import models  # Ensure all SQLAlchemy models are registered
Base.metadata.create_all(bind=engine)

from routes.scan import execute_scan
from services.trust_score import calculate_trust_score
from services.explainer import generate_plain_language_explanation


def verify():
    db = SessionLocal()
    print("=" * 60)
    print("TRUSTLENS VERIFICATION: 3 BENIGN URLS")
    print("=" * 60)

    benign_urls = [
        "https://github.com",
        "https://google.com",
        "https://python.org",
    ]

    for url in benign_urls:
        print(f"\nScanning {url}...")
        res = execute_scan(url, db)
        print(f"[BENIGN RESULT] Target: {url}")
        print(f"Trust Score: {res['trust_score']}/100 | Verdict: {res['verdict']}")
        print(f"Headline: {res['explanation']['headline']}")
        print(f"Reasons: {res['explanation']['reasons']}")
        print(f"Action: {res['explanation']['recommended_action']}")

    print("\n" + "=" * 60)
    print("TRUSTLENS VERIFICATION: 3 PHISHING URLS")
    print("=" * 60)

    phishing_urls = [
        "https://onlinesbi-kyc-pan-update.top/login.php",
        "https://hdfcbank-netbanking-alert.xyz/verify",
        "https://myaadhaar-update-card.click/download",
    ]

    for url in phishing_urls:
        print(f"\nScanning {url}...")
        res = execute_scan(url, db)
        print(f"[PHISHING RESULT] Target: {url}")
        print(f"Trust Score: {res['trust_score']}/100 | Verdict: {res['verdict']}")
        print(f"Override Active: {res['override_active']}")
        print(f"Headline: {res['explanation']['headline']}")
        print(f"Evidence Signals: {[e['signal'] for e in res['evidence']]}")

    print("\n" + "=" * 60)
    print("TRUSTLENS VERIFICATION: eMudhra INTERMEDIATE CA DISTRUST OVERRIDE")
    print("=" * 60)

    # eMudhra flagged intermediate case:
    emudhra_evidence = [
        {
            "signal": "Distrusted Certificate Authority",
            "severity": "critical",
            "explanation": "Issued by eMudhra Sub-CA 2024 (Class 3). CCADB subordinate cross-signing revocation.",
        }
    ]
    emudhra_score, emudhra_verdict, override_active, override_reason = calculate_trust_score(
        phishing_risk=10,
        cert_risk=95,
        hygiene_risk=15,
        community_risk=10,
        evidence=emudhra_evidence,
    )
    emudhra_explanation = generate_plain_language_explanation(
        trust_score=emudhra_score,
        verdict=emudhra_verdict,
        override_active=override_active,
        override_reason=override_reason,
        evidence=emudhra_evidence,
    )

    emudhra_result = {
        "url": "https://secure-portal-gov-gateway.in",
        "trust_score": emudhra_score,
        "verdict": emudhra_verdict,
        "override_active": override_active,
        "override_reason": override_reason,
        "explanation": emudhra_explanation,
        "evidence": emudhra_evidence,
    }
    print(json.dumps(emudhra_result, indent=2))

    print("\n" + "=" * 60)
    print("VERIFICATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    verify()
