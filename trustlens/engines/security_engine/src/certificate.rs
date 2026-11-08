use crate::models::CertificateResult;
use openssl::ssl::{SslConnector, SslMethod, SslVerifyMode};
use std::net::TcpStream;
use std::time::Duration;

pub fn inspect_certificate(domain: &str) -> Result<CertificateResult, String> {
    // 1. Build the SSL connector
    let mut builder = SslConnector::builder(SslMethod::tls())
        .map_err(|e| format!("Failed to build SSL: {}", e))?;

    // For this audit, we want to grab the cert even if it is self-signed or expired
    builder.set_verify(SslVerifyMode::NONE);
    let connector = builder.build();

    // 2. Open a real network connection to the domain on port 443
    let stream = TcpStream::connect(format!("{}:443", domain))
        .map_err(|e| format!("Network connection failed: {}", e))?;

    // Set a timeout so a hanging server doesn't freeze our engine
    stream.set_read_timeout(Some(Duration::from_secs(5))).ok();

    // 3. Perform the TLS Handshake
    let ssl_stream = connector.connect(domain, stream)
        .map_err(|e| format!("TLS handshake failed: {}", e))?;

    // 4. Download and extract the peer's certificate
    let cert = ssl_stream.ssl().peer_certificate()
        .ok_or("No peer certificate found")?;

    // Parse the full Issuer name dynamically
    let mut issuer_parts = Vec::new();
    for entry in cert.issuer_name().entries() {
        if let Ok(val) = entry.data().to_string() {
            issuer_parts.push(val.to_string());
        }
    }
    let issuer_name = if issuer_parts.is_empty() {
        "Unknown Issuer".to_string()
    } else {
        issuer_parts.join(", ")
    };

    // 5. The Curated Blocklist (eMudhra, WoSign, etc.)
    let distrusted_keywords = ["emudhra", "wosign", "startcom", "diginotar"];
    let ca_distrusted = distrusted_keywords
        .iter()
        .any(|&bad_ca| issuer_name.to_lowercase().contains(bad_ca));

    // 6. Real Public Key Size Math Check
    let mut weak_key = false;
    if let Ok(pub_key) = cert.public_key() {
        if let Ok(rsa) = pub_key.rsa() {
            // A secure RSA key should be at least 2048 bits
            if rsa.size() * 8 < 2048 {
                weak_key = true;
            }
        }
    }

    let mut findings = Vec::new();
    if ca_distrusted {
        findings.push(format!("Issuer '{}' is on the distrusted/compromised blocklist.", issuer_name));
    }
    if weak_key {
        findings.push("Weak public key length detected (< 2048 bits).".to_string());
    }

    Ok(CertificateResult {
        trusted: !ca_distrusted && !weak_key,
        issuer: issuer_name,
        expires_at: cert.not_after().to_string(), // Pull real expiry date from OpenSSL
        hostname: domain.to_string(),
        weak_key,
        ca_distrusted,
        findings,
    })
}
