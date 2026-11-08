from services.evidence_validator import validate_findings


findings = [
    {
        "id": "FINDING-001",
        "signal": "Missing HSTS",
        "severity": "medium",
        "evidence": "Strict-Transport-Security header is missing",
        "source": "Rust Security Engine",
        "timestamp": "2026-11-08T10:00:00Z"
    },
    {
        "id": "FINDING-002",
        "signal": "Suspicious URL",
        "severity": "unknown",
        "evidence": "Suspicious keyword detected",
        "source": "AI Engine",
        "timestamp": "2026-11-08T10:00:00Z"
    }
]

result = validate_findings(findings)

print("VALID FINDINGS:")
print(result["valid_findings"])

print("\nREJECTED FINDINGS:")
print(result["rejected_findings"])
