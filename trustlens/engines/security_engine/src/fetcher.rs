
use std::net::{IpAddr, ToSocketAddrs};
use std::time::Duration;
use reqwest::blocking::Client;
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

/// Validates whether an IP address is safe (blocks loopback, private ranges, link-local, etc.)
pub fn is_safe_ip(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            !v4.is_loopback() &&
            !v4.is_private() &&
            !v4.is_link_local() &&
            !v4.is_unspecified() &&
            !v4.is_broadcast() &&
            // Block Carrier-Grade NAT (100.64.0.0/10) and documentation blocks
            !(v4.octets()[0] == 100 && (v4.octets()[1] & 0b11000000) == 64) &&
            !(v4.octets()[0] == 192 && v4.octets()[1] == 0 && v4.octets()[2] == 2) // TEST-NET-1
        }
        IpAddr::V6(v6) => {
            !v6.is_loopback() &&
            !v6.is_unspecified() &&
            // Block unique local addresses (fc00::/7)
            !((v6.segments()[0] & 0xfe00) == 0xfc00) &&
            // Block link-local unicast (fe80::/10)
            !((v6.segments()[0] & 0xffc0) == 0xfe80)
        }
    }
}

/// Resolves hostname to check all associated IP addresses before connection
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

/// Secure, SSRF-safe HTTP/HTTPS fetcher with manual redirect hop inspection
pub fn safe_fetch(target_url: &str) -> Result<(StatusCode, String), FetchError> {
    let mut current_url = Url::parse(target_url).map_err(|_| FetchError::InvalidScheme)?;

    // Enforce scheme allowlist
    if current_url.scheme() != "http" && current_url.scheme() != "https" {
        return Err(FetchError::InvalidScheme);
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::none()) // Manual redirect handling for security validation
        .build()?;

    let max_redirects = 5;
    let mut hop_count = 0;

    loop {
        if hop_count >= max_redirects {
            return Err(FetchError::TooManyRedirects);
        }

        // Validate destination IP before making request
        validate_hostname_ips(&current_url)?;

        let response = client.get(current_url.as_str())
            .header("User-Agent", "TrustLens-Security-Auditor/1.0")
            .send()?;

        let status = response.status();

        // Check for HTTP redirect status codes
        if status.is_redirection() {
            if let Some(location) = response.headers().get("location") {
                let location_str = location.to_str().map_err(|_| FetchError::InvalidScheme)?;

                // Resolve relative redirect URLs
                current_url = current_url.join(location_str).map_err(|_| FetchError::InvalidScheme)?;

                if current_url.scheme() != "http" && current_url.scheme() != "https" {
                    return Err(FetchError::InvalidScheme);
                }

                hop_count += 1;
                continue;
            }
        }

        // Enforce maximum payload size limit (5MB ceiling)
        if let Some(content_length) = response.content_length() {
            if content_length > 5 * 1024 * 1024 {
                return Err(FetchError::PayloadTooLarge);
            }
        }

        let body = response.text()?;
        if body.len() > 5 * 1024 * 1024 {
            return Err(FetchError::PayloadTooLarge);
        }

        return Ok((status, body));
    }
}
