from threat_graph.threat_graph_builder import build_threat_graph

graph = build_threat_graph()

print("THREAT GRAPH BUILT FROM DATABASE")

print("\nAll entities:")

for entity, details in graph.get_all_entities().items():
    print(entity, "->", details)
