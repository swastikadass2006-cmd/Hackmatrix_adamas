from threat_graph.graph_manager import ThreatGraph
from threat_intelligence.domain_database import get_all_domains


def build_threat_graph():

    graph = ThreatGraph()

    # Get all domains from the threat database
    domains = get_all_domains()

    for item in domains:

        domain = item["domain"]

        # Add each known threat domain to the graph
        graph.add_entity(domain, "domain")

    return graph
