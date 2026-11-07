use std::net::{IpAddr, ToSocketAddrs};
use anyhow::{bail, Result};

pub fn validate_domain(domain: &str) -> Result<()> {
    if domain.is_empty() {
        bail!("Domain cannot be empty");
    }

    if domain.contains('/')
        || domain.contains('@')
        || domain.contains(':')
        || domain.contains('\\')
    {
        bail!("Invalid domain format");
    }

    let addresses: Vec<_> = (domain, 443).to_socket_addrs()?.collect();

    if addresses.is_empty() {
        bail!("Domain could not be resolved");
    }

    for address in addresses {
        let ip: IpAddr = address.ip();
        if !is_public_ip(ip) {
            bail!("Private, loopback, or non-global IP blocked by SSRF filter: {}", ip);
        }
    }

    Ok(())
}

fn is_public_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(ipv4) => {
            !ipv4.is_loopback()
                && !ipv4.is_private()
                && !ipv4.is_link_local()
                && !ipv4.is_broadcast()
                && !ipv4.is_unspecified()
        }
        IpAddr::V6(ipv6) => {
            !ipv6.is_loopback()
                && !ipv6.is_unspecified()
                && ((ipv6.segments()[0] & 0xfe00) != 0xfc00) // unique local fc00::/7
                && ((ipv6.segments()[0] & 0xffc0) != 0xfe80) // link-local unicast fe80::/10
        }
    }
}
