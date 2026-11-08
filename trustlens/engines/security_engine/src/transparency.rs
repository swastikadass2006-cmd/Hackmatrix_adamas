use chrono::{DateTime, Utc, Duration};
use serde::Deserialize;
use crate::models::CtResult;

#[derive(Deserialize)]
struct CtCertificate {
    not_before: Option<String>,
    #[allow(dead_code)]
    common_name: Option<String>,
}

pub async fn check_transparency(
    domain: &str
) -> anyhow::Result<CtResult> {

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::none())
        .build()?;

    let response = client
        .get("https://crt.sh/")
        .query(&[
            ("q", domain),
            ("output", "json")
        ])
        .send()
        .await?;

    if !response.status().is_success() {
        anyhow::bail!("crt.sh returned an error");
    }

    let records: Vec<CtCertificate> =
        response.json().await?;

    let cutoff = Utc::now() - Duration::days(3);

    let mut recent = 0;
    let mut findings = Vec::new();

    for record in records {

        if let Some(date) = record.not_before {

            if let Ok(parsed) =
                DateTime::parse_from_str(
                    &format!("{} +0000", date),
                    "%Y-%m-%dT%H:%M:%S %z"
                )
            {
                if parsed.with_timezone(&Utc) > cutoff {
                    recent += 1;
                }
            }
        }
    }

    if recent > 0 {
        findings.push(format!(
            "{} certificate records issued within 72 hours",
            recent
        ));
    } else {
        findings.push(
            "No recent certificate records found".to_string()
        );
    }

    Ok(CtResult {
        recent_certificates: recent,
        suspicious: false,
        findings,
    })
}
