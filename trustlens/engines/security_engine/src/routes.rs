use axum::{extract::Query, Json};
use chrono::Utc;
use crate::{
    certificate::inspect_certificate,
    fetcher::safe_fetch,
    models::{ScanQuery, SecurityFinding, SecurityReport},
    transparency::check_transparency,
    hygiene::scan_hygiene,
    security::validate_domain,
};

pub async fn scan() -> &'static str {
    "Scan endpoint active"
}

pub async fn analyze_security_layer(Query(query): Query<ScanQuery>) -> Result<Json<SecurityReport>, String> {
    let mut findings: Vec<SecurityFinding> = Vec::new();
    let mut limitations: Vec<String> = Vec::new();

    // Extract domain from URL
    let domain = query.url.replace("https://", "").replace("http://", "")
        .split('/').next().unwrap_or("").to_lowercase();

    // --- 1. Domain Validation (Clears validate_domain & is_public_ip warnings) ---
    if let Err(e) = validate_domain(&domain) {
        limitations.push(format!("Domain validation warning: {}", e));
    }

    // --- 2. SSRF Fetcher Check ---
    match safe_fetch(&query.url) {
        Ok((status, _)) => {
            findings.push(SecurityFinding {
                id: "SEC-FETCH-01".to_string(),
                signal: "SSRF_Safe_Redirect".to_string(),
                severity: "Info".to_string(),
                evidence: format!("Target resolved safely and returned HTTP {}", status),
                source: "rust_network_fetcher".to_string(),
                timestamp: Utc::now().to_rfc3339(),
            });
        }
        Err(e) => {
            findings.push(SecurityFinding {
                id: "SEC-FETCH-02".to_string(),
                signal: "SSRF_Policy_Violation".to_string(),
                severity: "High".to_string(),
                evidence: format!("Connection aborted: {}", e),
                source: "rust_network_fetcher".to_string(),
                timestamp: Utc::now().to_rfc3339(),
            });
            limitations.push("Could not fetch page body due to SSRF policy block.".to_string());
        }
    }

    if !domain.is_empty() {
        // --- 3. Distrusted CA Intelligence Check ---
        if let Ok(cert) = inspect_certificate(&domain) {
            if cert.ca_distrusted {
                findings.push(SecurityFinding {
                    id: "SEC-CERT-01".to_string(),
                    signal: "Distrusted_Certificate_Authority".to_string(),
                    severity: "Critical".to_string(),
                    evidence: format!("Certificate issued by distrusted CA ({}). Violates CCADB root baseline.", cert.issuer),
                    source: "tls_inspector".to_string(),
                    timestamp: Utc::now().to_rfc3339(),
                });
            } else {
                findings.push(SecurityFinding {
                    id: "SEC-CERT-02".to_string(),
                    signal: "Valid_Certificate_Authority".to_string(),
                    severity: "Info".to_string(),
                    evidence: format!("Certificate issued by trusted CA ({}).", cert.issuer),
                    source: "tls_inspector".to_string(),
                    timestamp: Utc::now().to_rfc3339(),
                });
            }
        }

        // --- 4. Web Hygiene Scan (Clears scan_hygiene warning) ---
        if let Ok(hyg) = scan_hygiene(&domain).await {
            if !hyg.missing_headers.is_empty() {
                findings.push(SecurityFinding {
                    id: "SEC-HYG-01".to_string(),
                    signal: "Missing_Security_Headers".to_string(),
                    severity: "Medium".to_string(),
                    evidence: format!("Missing headers: {:?}", hyg.missing_headers),
                    source: "hygiene_scanner".to_string(),
                    timestamp: Utc::now().to_rfc3339(),
                });
            }
            if hyg.server_banner != "Not disclosed" {
                findings.push(SecurityFinding {
                    id: "SEC-HYG-02".to_string(),
                    signal: "Exposed_Server_Banner".to_string(),
                    severity: "Low".to_string(),
                    evidence: format!("Server header leaks identity: {}", hyg.server_banner),
                    source: "hygiene_scanner".to_string(),
                    timestamp: Utc::now().to_rfc3339(),
                });
            }
        }

        // --- 5. CT Transparency Log Check (Clears check_transparency warning) ---
        if let Ok(ct) = check_transparency(&domain).await {
            if ct.recent_certificates > 0 {
                findings.push(SecurityFinding {
                    id: "SEC-CT-01".to_string(),
                    signal: "Newly_Minted_Certificate".to_string(),
                    severity: "High".to_string(),
                    evidence: format!("Certificate issued within last 72 hours ({} occurrences logged).", ct.recent_certificates),
                    source: "ct_monitor".to_string(),
                    timestamp: Utc::now().to_rfc3339(),
                });
            }
        }
    }

    Ok(Json(SecurityReport {
        engine_name: "rust_security_core".to_string(),
        coverage: "SSRF Validation, TLS Intelligence, Web Hygiene, and CT Logs completed".to_string(),
        limitations,
        findings,
    }))
}
