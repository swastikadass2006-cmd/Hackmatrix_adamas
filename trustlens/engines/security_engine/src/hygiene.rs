use crate::models::HygieneResult;

pub async fn scan_hygiene(
    domain: &str
) -> anyhow::Result<HygieneResult> {

    let url = format!("https://{}/", domain);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::none())
        .build()?;

    let response = client.get(&url).send().await?;

    let headers = response.headers();

    let required_headers = vec![
        "strict-transport-security",
        "content-security-policy",
        "x-frame-options",
        "x-content-type-options",
        "referrer-policy"
    ];

    let mut missing = Vec::new();

    for header in required_headers {

        if !headers.contains_key(header) {
            missing.push(header.to_string());
        }
    }

    let server = headers
        .get("server")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("Not disclosed")
        .to_string();

    let mut findings = Vec::new();

    for header in &missing {
        findings.push(format!(
            "Missing security header: {}",
            header
        ));
    }

    if server != "Not disclosed" {
        findings.push(format!(
            "Server banner exposed: {}",
            server
        ));
    }

    Ok(HygieneResult {
        https: true,
        missing_headers: missing,
        server_banner: server,
        findings,
    })
}
