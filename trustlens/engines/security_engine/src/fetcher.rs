use std::net::{IpAddr, ToSocketAddrs};
use std::time::Duration;
use reqwest::Client; // Switched to the async client
use reqwest::StatusCode;
use url::Url;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FetchError {
    #[error("Unsupported or invalid URL scheme. Only HTTP and HTTPS are allowed.")]
    InvalidScheme,
    #[error("SSRF Protection Triggered: Resolved IP {0} is private, loopback, or restricted.")]
    BlockedIp(IpAddr),
    #[error("Maximum redirect hops (5) exceeded.")]
    TooManyRedirects,
    #[error("HTTP request error: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("Response payload exceeded the size limit (max 5MB).")]
    PayloadTooLarge,
}

pub fn is_safe_ip(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            !v4.is_loopback() && !v4.is_private() && !v4.is_link_local() &&
            !v4.is_unspecified() && !v4.is_broadcast() &&
            !(v4.octets()[0] == 100 && (v4.octets()[1] & 0b11000000) == 64) &&
            !(v4.octets()[0] == 192 && v4.octets()[1] == 0 && v4.octets()[2] == 2)
        }
        IpAddr::V6(v6) => {
            !v6.is_loopback() && !v6.is_unspecified() &&
            !((v6.segments()[0] & 0xfe00) == 0xfc00) &&
            !((v6.segments()[0] & 0xffc0) == 0xfe80)
        }
    }
}

fn validate_hostname_ips(url: &Url) -> Result<(), FetchError> {
    let host = url.host_str().ok_or(FetchError::InvalidScheme)?;
    let port = url.port_or_known_default().unwrap_or(if url.scheme() == "https" { 443 } else { 80 });

    let addr_iter = format!("{}:{}", host, port)
        .to_socket_addrs()
        .map_err(|_| FetchError::InvalidScheme)?;

    for addr in addr_iter {
        let ip = addr.ip();
        if !is_safe_ip(&ip) {
            return Err(FetchError::BlockedIp(ip));
        }
    }
    Ok(())
}

// Added `async` to the function signature
pub async fn safe_fetch(target_url: &str) -> Result<(StatusCode, String), FetchError> {
    let mut current_url = Url::parse(target_url).map_err(|_| FetchError::InvalidScheme)?;

    if current_url.scheme() != "http" && current_url.scheme() != "https" {
        return Err(FetchError::InvalidScheme);
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::none())
        .build()?;

    let max_redirects = 5;
    let mut hop_count = 0;

    loop {
        if hop_count >= max_redirects {
            return Err(FetchError::TooManyRedirects);
        }

        validate_hostname_ips(&current_url)?;

        // Added .await to the network request
        let response = client.get(current_url.as_str())
            .header("User-Agent", "TrustLens-Security-Auditor/1.0")
            .send()
            .await?;

        let status = response.status();

        if status.is_redirection() {
            if let Some(location) = response.headers().get("location") {
                let location_str = location.to_str().map_err(|_| FetchError::InvalidScheme)?;
                current_url = current_url.join(location_str).map_err(|_| FetchError::InvalidScheme)?;

                if current_url.scheme() != "http" && current_url.scheme() != "https" {
                    return Err(FetchError::InvalidScheme);
                }
                hop_count += 1;
                continue;
            }
        }

        if let Some(content_length) = response.content_length() {
            if content_length > 5 * 1024 * 1024 {
                return Err(FetchError::PayloadTooLarge);
            }
        }

        // Added .await to body parsing
        let body = response.text().await?;
        if body.len() > 5 * 1024 * 1024 {
            return Err(FetchError::PayloadTooLarge);
        }

        return Ok((status, body));
    }
}
