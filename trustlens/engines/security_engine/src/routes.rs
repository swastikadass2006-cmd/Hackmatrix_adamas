use axum::{
    extract::Query,
    Json
};

use serde::Deserialize;

use crate::{
    models::ScanResponse,
    certificate::inspect_certificate,
    transparency::check_transparency,
    hygiene::scan_hygiene,
    security::validate_domain
};

#[derive(Deserialize)]
pub struct ScanQuery {
    pub domain: String
}

pub async fn scan(
    Query(query): Query<ScanQuery>
) -> Result<Json<ScanResponse>, String> {

    let domain = query.domain.trim().to_lowercase();

    validate_domain(&domain)
        .map_err(|e| e.to_string())?;

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
    } else if certificate.weak_key ||
        !hygiene.missing_headers.is_empty() {
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
        overall_risk: overall_risk.to_string()
    }))
}
