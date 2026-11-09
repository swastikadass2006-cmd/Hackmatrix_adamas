use std::net::SocketAddr;
use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

// All module declarations must be in main.rs, NOT routes.rs
pub mod models;
pub mod routes;
pub mod certificate;
pub mod transparency;
pub mod hygiene;
pub mod security;
pub mod fetcher;
pub mod canonical;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/health", get(health))
        .route("/scan", get(routes::scan))
        .route("/api/v1/security/analyze", get(routes::analyze_security_layer))
        .route("/canonicalize", axum::routing::post(routes::canonicalize_report_endpoint))
        .route("/api/v1/security/canonicalize", axum::routing::post(routes::canonicalize_report_endpoint))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8001));
    println!("TrustLens Security Engine running on port 8001");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> &'static str {
    "TrustLens Security Engine is running"
}
