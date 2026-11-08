use std::net::SocketAddr;
use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

// All module declarations must be at the top
mod models;
mod routes;
mod certificate;
mod transparency;
mod hygiene;
mod security;
mod fetcher; // <- Added here!

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/health", get(health))
        .route("/scan", get(routes::scan))
        .route("/api/v1/security/analyze", get(routes::analyze_security_layer))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8001));
    println!("TrustLens Security Engine running on port 8001");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> &'static str {
    "TrustLens Security Engine is running"
}

// Example usage function.
// Eventually, you will want to call fetcher::safe_fetch(url)
// directly inside your routes::scan or routes::analyze_security_layer functions.
pub fn analyze_target(url: &str) {
    match fetcher::safe_fetch(url) {
        Ok((status, body)) => {
            println!("Safely fetched target URL. Status: {}, Body length: {} bytes", status, body.len());
        }
        Err(e) => {
            println!("Fetch blocked or failed due to safety policies: {}", e);
        }
    }
}
