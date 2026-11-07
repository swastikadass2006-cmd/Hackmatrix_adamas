use serde::Serialize;

#[derive(Serialize)]
pub struct ScanResponse {
    pub domain: String,
    pub certificate: CertificateResult,
    pub transparency: CtResult,
    pub hygiene: HygieneResult,
    pub overall_risk: String,
}

#[derive(Serialize)]
pub struct CertificateResult {
    pub trusted: bool,
    pub issuer: String,
    pub expires_at: String,
    pub hostname: String,
    pub weak_key: bool,
    pub ca_distrusted: bool,
    pub findings: Vec<String>,
}

#[derive(Serialize)]
pub struct CtResult {
    pub recent_certificates: usize,
    pub suspicious: bool,
    pub findings: Vec<String>,
}

#[derive(Serialize)]
pub struct HygieneResult {
    pub https: bool,
    pub missing_headers: Vec<String>,
    pub server_banner: String,
    pub findings: Vec<String>,
}


