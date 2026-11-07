from threat_intelligence.domain_database import (
    create_table,
    add_domain,
    get_all_domains
)

from threat_intelligence.threat_lookup import check_domain


# Create database
create_table()

# Insert sample domains
print(add_domain(
    "phishing-demo.example",
    "Phishing",
    95,
    "Test Dataset"
))

print(add_domain(
    "malware-demo.example",
    "Malware",
    90,
    "Test Dataset"
))

# Display all domains
print("\nAll Threat Domains:")

for domain in get_all_domains():
    print(domain)

# Search for a domain
print("\nSearching for a domain:")

print(check_domain(
    "https://phishing-demo.example/login"
))
