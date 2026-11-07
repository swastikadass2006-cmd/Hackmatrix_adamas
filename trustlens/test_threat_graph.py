from threat_graph.graph_manager import ThreatGraph

graph = ThreatGraph()

# Add domains
graph.add_entity("fake-bank.example", "domain")
graph.add_entity("fake-login.example", "domain")

# Add IP address
graph.add_entity("192.0.2.10", "ip")

# Add SSL certificate
graph.add_entity("CERT-001", "certificate")

# Connect entities
graph.add_relationship(
    "fake-bank.example",
    "192.0.2.10",
    "resolves_to"
)

graph.add_relationship(
    "fake-login.example",
    "192.0.2.10",
    "resolves_to"
)

graph.add_relationship(
    "fake-bank.example",
    "CERT-001",
    "uses_certificate"
)

print("ALL THREAT ENTITIES:")
print(graph.get_all_entities())

print("\nCONNECTIONS OF fake-bank.example:")
print(graph.get_connections("fake-bank.example"))
