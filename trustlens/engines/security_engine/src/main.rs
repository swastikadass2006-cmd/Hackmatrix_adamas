use axum::{extract::Query, routing::get, Json, Router};
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

    // Spawn tasks concurrently
    let cert_task = tokio::task::spawn_blocking({
        let domain = domain.clone();
        move || inspect_cert_chain(&domain)
    });

    let hygiene_task = check_web_hygiene(format!("https://{}", domain));

    let cert_result = cert_task.await.unwrap();
    let hygiene_result = hygiene_task.await;

    Json(serde_json::json!({
        "url": query.url,
        "results": [cert_result, hygiene_result]
    }))
}

/// Establishes a raw TCP socket, wraps it in TLS (ignoring validation to allow bad certs), and parses the ASN.1 structure.
fn inspect_cert_chain(domain: &str) -> EngineResponse {
    let mut evidence = Vec::new();
    let mut score = 0;

    let target = format!("{}:443", domain);
    let stream = match TcpStream::connect(&target) {
        Ok(s) => s,
        Err(_) => return EngineResponse {
            engine_name: "TrustChain".into(),
            risk_score: 100,
            evidence: vec![Evidence { signal: "Socket Error".into(), severity: "critical".into(), explanation: "Failed to connect to host.".into() }]
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

            // Parse raw x509 bytes
            if let Ok((_, x509_cert)) = x509_parser::parse_x509_certificate(&der_bytes) {
                let issuer = x509_cert.issuer().to_string();

                // 1. The eMudhra Hook
                if issuer.to_lowercase().contains("emudhra") || issuer.to_lowercase().contains("symantec") {
                    score = 100;
                    evidence.push(Evidence {
                        signal: "Distrusted Certificate Authority".into(),
                        severity: "critical".into(),
                        explanation: format!("Issued by a blocked CA ({}). Potential key-generation flaw.", issuer),
                    });
                }

                // Add weak key logic here by inspecting x509_cert.public_key()
            }
        }
    }

    EngineResponse { engine_name: "TrustChain".into(), risk_score: score, evidence }
}

/// Passively scans headers using reqwest
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
