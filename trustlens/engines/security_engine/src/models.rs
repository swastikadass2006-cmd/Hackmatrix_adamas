use serde::{Deserialize, Serialize};

// --- Hackathon Standardized Module 5 Output ---

#[derive(Serialize, Deserialize, Debug)]
pub struct SecurityFinding {
    pub id: String,
    pub signal: String,
    pub severity: String,
    pub evidence: String,
    pub source: String,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SecurityReport {
    pub engine_name: String,
    pub coverage: String,
    pub limitations: Vec<String>,
    pub findings: Vec<SecurityFinding>,
}

#[derive(Deserialize)]
pub struct ScanQuery {
    pub url: String,
}

// --- Internal Structs for your existing checks ---

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
