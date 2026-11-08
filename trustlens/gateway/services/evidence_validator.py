REQUIRED_FIELDS = [
    "id",
    "signal",
    "severity",
    "evidence",
    "source",
    "timestamp"
]

VALID_SEVERITIES = {
    "critical",
    "high",
    "medium",
    "low",
    "info"
}


def validate_findings(findings):
    """
    Validate structured findings received from security engines.
    Invalid findings are rejected.
    """

    valid_findings = []
    rejected_findings = []

    if not isinstance(findings, list):
        return {
            "valid_findings": [],
            "rejected_findings": ["Findings must be a list"]
        }

    for index, finding in enumerate(findings):

        if not isinstance(finding, dict):
            rejected_findings.append(
                f"Finding {index}: Must be a dictionary"
            )
            continue

        missing_fields = [
            field for field in REQUIRED_FIELDS
            if not finding.get(field)
        ]

        if missing_fields:
            rejected_findings.append(
                f"Finding {index}: Missing fields {missing_fields}"
            )
            continue

        severity = finding["severity"].lower()

        if severity not in VALID_SEVERITIES:
            rejected_findings.append(
                f"Finding {index}: Invalid severity"
            )
            continue

        valid_findings.append(finding)

    return {
        "valid_findings": valid_findings,
        "rejected_findings": rejected_findings
    }
