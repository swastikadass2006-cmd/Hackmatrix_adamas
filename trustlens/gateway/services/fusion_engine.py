from datetime import datetime, timezone


def classify_website(engine_results):
    findings = []
    limitations = []
    completed_checks = 0
    total_checks = 0

    authoritative_confirmation = False

    for result in engine_results:
        total_checks += result.get("coverage", {}).get("total", 0)
        completed_checks += result.get("coverage", {}).get("completed", 0)

        limitations.extend(result.get("limitations", []))

        for finding in result.get("findings", []):
            findings.append(finding)

            if (
                finding.get("authoritative") is True
                and finding.get("severity") in ["critical", "high"]
            ):
                authoritative_confirmation = True

    severities = [
        finding.get("severity", "").lower()
        for finding in findings
    ]

    if authoritative_confirmation:
        classification = "Confirmed Malicious"

    elif "critical" in severities or "high" in severities:
        classification = "High Risk"

    elif "medium" in severities or "low" in severities:
        classification = "Suspicious"

    elif total_checks > 0 and completed_checks == total_checks and not findings:
        classification = "Safe-looking / No indicators"

    else:
        classification = "Inconclusive"

    return {
        "classification": classification,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "evidence_coverage": {
            "completed": completed_checks,
            "total": total_checks,
            "display": f"{completed_checks} of {total_checks} checks completed"
        },
        "findings": findings,
        "limitations": limitations
    }
