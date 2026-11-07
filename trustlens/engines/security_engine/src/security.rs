use std::net::{IpAddr, ToSocketAddrs};
use anyhow::{bail, Result};

pub fn validate_domain(domain: &str) -> Result<()> {

    if domain.is_empty() {
        bail!("Domain cannot be empty");
    }

    if domain.contains('/') ||
        domain.contains('@') ||
        domain.contains(':') ||
        domain.contains('\\') {
        bail!("Invalid domain format");
    }

    let addresses: Vec<_> = (
        domain,
        443
    ).to_socket_addrs()?.collect();

    if addresses.is_empty() {
        bail!("Domain could not be resolved");
    }

    for address in addresses {

        let ip: IpAddr = address.ip();

        let is_public = match ip {
            IpAddr::V4(ip) => {
                ip.is_global()
            },
            IpAddr::V6(ip) => {
                ip.is_global()
            }
        };

        if !is_public {
            bail!("Private or non-global IP blocked");
        }
    }

    Ok(())
}
