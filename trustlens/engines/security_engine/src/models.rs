use serde::Serialize;

#[derive(Serialize)]
pub struct Evidence {
    pub signal: String,
    pub severity: String,
    pub explanation: String,
}

#[derive(Serialize)]
pub struct EngineResult {
    pub engine_name: String,
    pub risk_score: u8,
    pub evidence: Vec<Evidence>,
}

#[derive(Serialize)]
pub struct AnalyzeResponse {
    pub url: String,
    pub score: u8,
    pub verdict: String,
    pub results: Vec<EngineResult>,
    pub evidence: Vec<Evidence>,
}

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
