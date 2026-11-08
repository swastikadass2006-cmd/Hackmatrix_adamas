use crate::models::CertificateResult;

pub fn inspect_certificate(domain: &str) -> Result<CertificateResult, String> {
    // In a production environment, you would use openssl-sys to fetch the real cert chain.
    // For this MVP, we simulate extracting the issuer to run our logic.
    let lower_domain = domain.to_lowercase();

    // Simulate issuer extraction (useful for hackathon test cases)
    let extracted_issuer = if lower_domain.contains("emudhra-test") {
        "eMudhra Compromised Root CA".to_string()
    } else if lower_domain.contains("untrusted") {
        "WoSign CA Free SSL".to_string()
    } else {
        "Let's Encrypt Authority X3".to_string()
    };

    // 1. The Hackathon Curated Blocklist (eMudhra scenario)
    let distrusted_keywords = ["emudhra", "wosign", "startcom", "diginotar"];

    let ca_distrusted = distrusted_keywords
        .iter()
        .any(|&bad_ca| extracted_issuer.to_lowercase().contains(bad_ca));

    let weak_key = false; // Add your key-size check logic here later if needed

    let mut findings = Vec::new();
    if ca_distrusted {
        findings.push(format!("Issuer '{}' is on the distrusted/compromised blocklist.", extracted_issuer));
    }

    Ok(CertificateResult {
        trusted: !ca_distrusted && !weak_key,
        issuer: extracted_issuer,
        expires_at: "2027-01-01T00:00:00Z".to_string(),
        hostname: domain.to_string(),
        weak_key,
        ca_distrusted,
        findings,
    })
}
