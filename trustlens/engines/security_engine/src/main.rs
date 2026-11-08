use std::net::SocketAddr;
use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

// All module declarations must be in main.rs, NOT routes.rs
mod models;
mod routes;
mod certificate;
mod transparency;
mod hygiene;
mod security;
mod fetcher;

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
