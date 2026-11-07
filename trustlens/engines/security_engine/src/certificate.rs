use openssl::ssl::{
    SslConnector,
    SslMethod,
    SslVerifyMode
};

use std::net::TcpStream;
use crate::models::CertificateResult;

pub fn inspect_certificate(
    domain: &str
) -> anyhow::Result<CertificateResult> {

    let mut builder =
        SslConnector::builder(SslMethod::tls())?;

    // Inspect the peer certificate even if
    // normal certificate verification fails.
    builder.set_verify(SslVerifyMode::NONE);

    let connector = builder.build();

    let stream = TcpStream::connect(
        (domain, 443)
    )?;

    stream.set_read_timeout(
        Some(std::time::Duration::from_secs(5))
    )?;

    stream.set_write_timeout(
        Some(std::time::Duration::from_secs(5))
    )?;

    let ssl_stream = connector.connect(
        domain,
        stream
    )?;

    let cert = ssl_stream
        .ssl()
        .peer_certificate()
        .ok_or_else(|| anyhow::anyhow!(
            "No certificate received"
        ))?;

    let issuer = cert
        .issuer_name()
        .entries()
        .next()
        .map(|e| {
            String::from_utf8_lossy(
                e.data().as_slice()
            ).to_string()
        })
        .unwrap_or_default();

    let expires_at = cert
        .not_after()
        .to_string();

    let public_key = cert.public_key()?;

    let weak_key = public_key.bits() < 2048;

    let ca_distrusted = is_distrusted_ca(&issuer);

    let mut findings = Vec::new();

    if weak_key {
        findings.push(
            "Weak public key detected".to_string()
        );
    }

    if ca_distrusted {
        findings.push(
            "Certificate issuer matches distrust policy"
            .to_string()
        );
    }

    if findings.is_empty() {
        findings.push(
            "No configured certificate policy violations found"
            .to_string()
        );
    }

    Ok(CertificateResult {
        trusted: false,
        issuer,
        expires_at,
        hostname: domain.to_string(),
        weak_key,
        ca_distrusted,
        findings,
    })
}

fn is_distrusted_ca(issuer: &str) -> bool {

    let blocked = std::env::var(
        "DISTRUSTED_CA_PATTERNS"
    ).unwrap_or_default();

    blocked
    .split(',')
    .filter(|s| !s.trim().is_empty())
    .any(|ca| {
        issuer.to_lowercase()
        .contains(&ca.trim().to_lowercase())
    })
}
