use axum::{extract::Query, routing::get, Json, Router};
use chrono::{DateTime, Utc};
use native_tls::TlsConnector;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use x509_parser::prelude::*;

#[derive(Serialize)]
struct Evidence {
    signal: String,
    severity: String,
    explanation: String,
}

#[derive(Serialize)]
struct EngineResponse {
    engine_name: String,
    risk_score: u8,
    evidence: Vec<Evidence>,
}

#[derive(Deserialize)]
struct ScanQuery {
    url: String,
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/api/v1/security/analyze", get(analyze_security_layer));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8001").await.unwrap();
    println!("Rust Security Engine running on port 8001");
    axum::serve(listener, app).await.unwrap();
}

async fn analyze_security_layer(Query(query): Query<ScanQuery>) -> Json<serde_json::Value> {
    let domain = query.url.replace("https://", "").replace("http://", "").split('/').next().unwrap_or("").to_string();

    // 1. Run Certificate & Weak-Key Inspection synchronously (blocking socket/crypto ops)
    let cert_task = tokio::task::spawn_blocking({
        let domain = domain.clone();
        move || inspect_cert_chain(&domain)
    });

    // 2. Run CT Log Monitor asynchronously via crt.sh
    let ct_task = check_ct_logs(&domain);

    // 3. Run Web Hygiene Header Scanner asynchronously
    let hygiene_task = check_web_hygiene(format!("https://{}", domain));

    let cert_result = cert_task.await.unwrap();
    let ct_result = ct_task.await;
    let hygiene_result = hygiene_task.await;

    Json(serde_json::json!({
        "url": query.url,
        "results": [cert_result, ct_result, hygiene_result]
    }))
}

/// Inspects the TLS certificate chain, issuer blocklists, and weak cryptographic keys.
fn inspect_cert_chain(domain: &str) -> EngineResponse {
    let mut evidence = Vec::new();
    let mut score = 0;

    let target = format!("{}:443", domain);
    let stream = match TcpStream::connect(&target) {
        Ok(s) => s,
        Err(_) => return EngineResponse {
            engine_name: "TrustChain".into(),
            risk_score: 100,
            evidence: vec![Evidence {
                signal: "Socket Connection Failed".into(),
                severity: "critical".into(),
                explanation: "Could not connect to target host on port 443.".into()
            }]
        }
    };

    let connector = TlsConnector::builder()
        .danger_accept_invalid_certs(true)
        .danger_accept_invalid_hostnames(true)
        .build()
        .unwrap();

    if let Ok(tls_stream) = connector.connect(domain, stream) {
        if let Ok(Some(cert)) = tls_stream.peer_certificate() {
            let der_bytes = cert.to_der().unwrap();

            if let Ok((_, x509_cert)) = x509_parser::parse_x509_certificate(&der_bytes) {
                let issuer = x509_cert.issuer().to_string();

                // 1. Distrusted CA / eMudhra Incident Check
                if issuer.to_lowercase().contains("emudhra") || issuer.to_lowercase().contains("symantec") {
                    score = 100;
                    evidence.push(Evidence {
                        signal: "Distrusted Certificate Authority".into(),
                        severity: "critical".into(),
                        explanation: format!("Issued by a blocked CA ({}). Potential key-generation flaw.", issuer),
                    });
                }

                // 2. Weak Key Linter (RSA / EC modulus length checks)
                let public_key = x509_cert.public_key();
                if let Ok(rsa_pub) = public_key.parsed() {
                    match rsa_pub {
                        x509_parser::public_key::PublicKey::RSA(pub_key) => {
                            let key_size = pub_key.modulus.len() * 8;
                            if key_size < 2048 {
                                score = max_score(score, 80);
                                evidence.push(Evidence {
                                    signal: "Weak RSA Key Size".into(),
                                    severity: "high".into(),
                                    explanation: format!("RSA key size is {} bits (minimum 2048 required).", key_size),
                                });
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    EngineResponse { engine_name: "TrustChain".into(), risk_score: score, evidence }
}

/// Queries crt.sh to check Certificate Transparency logs for newly minted certs or lookalikes.
async fn check_ct_logs(domain: &str) -> EngineResponse {
    let mut evidence = Vec::new();
    let mut score = 0;
    let client = Client::builder().timeout(std::time::Duration::from_secs(5)).build().unwrap();
    let crt_url = format!("https://crt.sh/?q={}&output=json", domain);

    if let Ok(resp) = client.get(&crt_url).send().await {
        if let Ok(logs) = resp.json::<Vec<serde_json::Value>>().await {
            if logs.is_empty() {
                return EngineResponse {
                    engine_name: "CTMonitor".into(),
                    risk_score: 40,
                    evidence: vec![Evidence {
                        signal: "No CT Logs Found".into(),
                        severity: "medium".into(),
                        explanation: "Domain has no public Certificate Transparency records.".into(),
                    }],
                };
            }

            // Check entry timestamp of the latest certificate
            if let Some(latest) = logs.first() {
                if let Some(entry_time_str) = latest.get("entry_timestamp").and_then(|v| v.as_str()) {
                    if let Ok(entry_dt) = DateTime::parse_from_str(entry_time_str, "%Y-%m-%dT%H:%M:%S") {
                        let days_old = (Utc::now() - entry_dt.with_timezone(&Utc)).num_days();
                        if days_old < 3 {
                            score += 60;
                            evidence.push(Evidence {
                                signal: "Newly Issued Certificate".into(),
                                severity: "high".into(),
                                explanation: format!("Certificate was issued only {} days ago. Highly suspicious for spoofed portals.", days_old),
                            });
                        }
                    }
                }
            }
        }
    }

    EngineResponse { engine_name: "CTMonitor".into(), risk_score: score, evidence }
}

/// Passively scans HTTP headers for security posture
async fn check_web_hygiene(url: String) -> EngineResponse {
    let mut evidence = Vec::new();
    let mut score = 0;

    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .unwrap();

    if let Ok(response) = client.get(&url).send().await {
        let headers = response.headers();

        if !headers.contains_key("strict-transport-security") {
            score += 10;
            evidence.push(Evidence {
                signal: "Missing HSTS".into(),
                severity: "medium".into(),
                explanation: "Missing Strict-Transport-Security allows downgrade attacks.".into(),
            });
        }

        if let Some(server) = headers.get("server") {
            let server_str = server.to_str().unwrap_or("");
            if server_str.chars().any(|c| c.is_ascii_digit()) {
                score += 15;
                evidence.push(Evidence {
                    signal: "Exposed Server Version".into(),
                    severity: "low".into(),
                    explanation: format!("Server header leaks version: {}", server_str),
                });
            }
        }
    }

    EngineResponse { engine_name: "WebHygiene".into(), risk_score: score, evidence }
}

fn max_score(a: u8, b: u8) -> u8 {
    if a > b { a } else { b }
}

mod models;
mod routes;
mod certificate;
mod transparency;
mod hygiene;
mod security;

use axum::{
    routing::get,
    Router
};

use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {

    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/health", get(health))
        .route("/scan", get(routes::scan))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind(
        "0.0.0.0:8001"
    )
        .await
        .unwrap();

    println!(
        "TrustLens Security Engine running on port 8001"
    );

    axum::serve(listener, app)
        .await
        .unwrap();
}

async fn health() -> &'static str {
    "TrustLens Security Engine is running"
}
