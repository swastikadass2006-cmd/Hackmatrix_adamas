use axum::{extract::Query, Json};
use serde::Deserialize;

use crate::{
    certificate::inspect_certificate,
    hygiene::scan_hygiene,
    models::{AnalyzeResponse, EngineResult, Evidence, ScanResponse},
    security::validate_domain,
    transparency::check_transparency,
};

#[derive(Deserialize)]
pub struct ScanQuery {
    pub domain: String,
}

#[derive(Deserialize)]
pub struct AnalyzeQuery {
    pub url: String,
}

pub async fn scan(Query(query): Query<ScanQuery>) -> Result<Json<ScanResponse>, String> {
    let domain = query.domain.trim().to_lowercase();

    validate_domain(&domain).map_err(|e| e.to_string())?;

    let certificate = tokio::task::spawn_blocking({
        let domain = domain.clone();
        move || inspect_certificate(&domain)
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;

    let transparency = check_transparency(&domain)
        .await
        .map_err(|e| e.to_string())?;

    let hygiene = scan_hygiene(&domain)
        .await
        .map_err(|e| e.to_string())?;

    let overall_risk = if certificate.ca_distrusted {
        "CRITICAL"
    } else if certificate.weak_key || !hygiene.missing_headers.is_empty() {
        "HIGH"
    } else if transparency.recent_certificates > 0 {
        "MEDIUM"
    } else {
        "REQUIRES FURTHER ANALYSIS"
    };

    Ok(Json(ScanResponse {
        domain,
        certificate,
        transparency,
        hygiene,
        overall_risk: overall_risk.to_string(),
    }))
}

pub async fn analyze_security_layer(
    Query(query): Query<AnalyzeQuery>,
) -> Result<Json<AnalyzeResponse>, String> {
    let raw_url = query.url.trim();
    let domain = raw_url
        .replace("https://", "")
        .replace("http://", "")
        .split('/')
        .next()
        .unwrap_or("")
        .split(':')
        .next()
        .unwrap_or("")
        .to_lowercase();

    if domain.is_empty() {
        return Err("URL does not contain a valid hostname".to_string());
    }

    validate_domain(&domain).map_err(|e| e.to_string())?;

    // 1. Certificate inspection
    let cert_res = tokio::task::spawn_blocking({
        let domain = domain.clone();
        move || inspect_certificate(&domain)
    })
    .await
    .map_err(|e| e.to_string());

    let mut all_evidence: Vec<Evidence> = Vec::new();
    let mut trust_chain_risk: u8 = 0;
    let mut trust_chain_evidence: Vec<Evidence> = Vec::new();

    match cert_res {
        Ok(Ok(cert)) => {
            if cert.ca_distrusted {
                trust_chain_risk = 100;
                let ev = Evidence {
                    signal: "Distrusted Certificate Authority".to_string(),
                    severity: "critical".to_string(),
                    explanation: format!(
                        "Certificate issued by distrusted CA ({}). Violates CCADB root baseline.",
                        cert.issuer
                    ),
                };
                all_evidence.push(Evidence {
                    signal: ev.signal.clone(),
                    severity: ev.severity.clone(),
                    explanation: ev.explanation.clone(),
                });
                trust_chain_evidence.push(ev);
            }
            if cert.weak_key {
                trust_chain_risk = std::cmp::max(trust_chain_risk, 80);
                let ev = Evidence {
                    signal: "Weak Public Key Length".to_string(),
                    severity: "high".to_string(),
                    explanation: "Asymmetric key length is below 2048-bit NIST recommendation."
                        .to_string(),
                };
                all_evidence.push(Evidence {
                    signal: ev.signal.clone(),
                    severity: ev.severity.clone(),
                    explanation: ev.explanation.clone(),
                });
                trust_chain_evidence.push(ev);
            }
        }
        _ => {
            trust_chain_risk = 50;
            let ev = Evidence {
                signal: "TLS Handshake Incomplete".to_string(),
                severity: "medium".to_string(),
                explanation: "Could not establish direct TLS connection on port 443.".to_string(),
            };
            all_evidence.push(Evidence {
                signal: ev.signal.clone(),
                severity: ev.severity.clone(),
                explanation: ev.explanation.clone(),
            });
            trust_chain_evidence.push(ev);
        }
    }

    // 2. CT Transparency Log Check
    let mut ct_risk: u8 = 0;
    let mut ct_evidence: Vec<Evidence> = Vec::new();
    if let Ok(ct) = check_transparency(&domain).await {
        if ct.recent_certificates > 0 {
            ct_risk = 60;
            let ev = Evidence {
                signal: "Newly Minted Certificate (crt.sh)".to_string(),
                severity: "high".to_string(),
                explanation: format!(
                    "Certificate issued within the last 72 hours ({} occurrences logged).",
                    ct.recent_certificates
                ),
            };
            all_evidence.push(Evidence {
                signal: ev.signal.clone(),
                severity: ev.severity.clone(),
                explanation: ev.explanation.clone(),
            });
            ct_evidence.push(ev);
        }
    }

    // 3. Web Hygiene Scan
    let mut hygiene_risk: u8 = 0;
    let mut hygiene_evidence: Vec<Evidence> = Vec::new();
    if let Ok(hyg) = scan_hygiene(&domain).await {
        if hyg.missing_headers.contains(&"strict-transport-security".to_string()) {
            hygiene_risk += 15;
            let ev = Evidence {
                signal: "Missing HSTS Header".to_string(),
                severity: "medium".to_string(),
                explanation: "Strict-Transport-Security header is missing, allowing protocol downgrade.".to_string(),
            };
            all_evidence.push(Evidence {
                signal: ev.signal.clone(),
                severity: ev.severity.clone(),
                explanation: ev.explanation.clone(),
            });
            hygiene_evidence.push(ev);
        }
        if hyg.missing_headers.contains(&"content-security-policy".to_string()) {
            hygiene_risk += 10;
            let ev = Evidence {
                signal: "Missing CSP Header".to_string(),
                severity: "low".to_string(),
                explanation: "Content-Security-Policy header is absent.".to_string(),
            };
            all_evidence.push(Evidence {
                signal: ev.signal.clone(),
                severity: ev.severity.clone(),
                explanation: ev.explanation.clone(),
            });
            hygiene_evidence.push(ev);
        }
        if hyg.server_banner != "Not disclosed" {
            hygiene_risk += 10;
            let ev = Evidence {
                signal: "Exposed Server Software Banner".to_string(),
                severity: "low".to_string(),
                explanation: format!("Server header leaks software identity: {}", hyg.server_banner),
            };
            all_evidence.push(Evidence {
                signal: ev.signal.clone(),
                severity: ev.severity.clone(),
                explanation: ev.explanation.clone(),
            });
            hygiene_evidence.push(ev);
        }
    }

    let results = vec![
        EngineResult {
            engine_name: "TrustChain".to_string(),
            risk_score: trust_chain_risk,
            evidence: trust_chain_evidence,
        },
        EngineResult {
            engine_name: "CTMonitor".to_string(),
            risk_score: ct_risk,
            evidence: ct_evidence,
        },
        EngineResult {
            engine_name: "WebHygiene".to_string(),
            risk_score: hygiene_risk,
            evidence: hygiene_evidence,
        },
    ];

    let max_risk = trust_chain_risk.max(ct_risk).max(hygiene_risk);
    let final_score = 100u8.saturating_sub(max_risk);
    let verdict = if final_score >= 75 {
        "safe"
    } else if final_score >= 40 {
        "suspicious"
    } else {
        "malicious"
    };

    Ok(Json(AnalyzeResponse {
        url: query.url,
        score: final_score,
        verdict: verdict.to_string(),
        results,
        evidence: all_evidence,
    }))
}
