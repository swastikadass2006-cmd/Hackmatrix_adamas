def calculate_trust_score(
    phishing_risk,
    cert_risk,
    hygiene_risk,
    community_risk
):
    risk = (
        0.40 * phishing_risk +
        0.25 * cert_risk +
        0.15 * hygiene_risk +
        0.20 * community_risk
    )

    trust_score = round(100 - risk)

    if trust_score >= 75:
        verdict = "safe"
    elif trust_score >= 40:
        verdict = "suspicious"
    else:
        verdict = "malicious"

    return trust_score, verdict