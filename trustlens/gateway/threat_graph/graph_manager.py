class ThreatGraph:

    def __init__(self):
        self.graph = {}

    def add_entity(self, entity, entity_type):
        if entity not in self.graph:
            self.graph[entity] = {
                "type": entity_type,
                "connections": []
            }

    def add_relationship(self, source, target, relationship):
        if source not in self.graph:
            raise ValueError(f"{source} does not exist")

        if target not in self.graph:
            raise ValueError(f"{target} does not exist")

        self.graph[source]["connections"].append({
            "target": target,
            "relationship": relationship
        })

        self.graph[target]["connections"].append({
            "target": source,
            "relationship": relationship
        })

    def get_connections(self, entity):
        if entity not in self.graph:
            return {"error": "Entity not found"}

        return self.graph[entity]

    def get_all_entities(self):
        return self.graph
