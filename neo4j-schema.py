from neo4j import GraphDatabase, RoutingControl, Result
from collections import OrderedDict
from json import dump

class Neo4jDB:
    def __init__(self, uri, user, password, database=None):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.database = database
    
    def close(self):
        self.driver.close()
    
    def get_graph_schema(self, graph):
        nodes = []
        for key in graph.nodes._entity_dict:
            nodes.append({
                "key": graph.nodes._entity_dict[key].element_id,
                "labels": list(graph.nodes._entity_dict[key].labels),
                "properties": {
                    "name": graph.nodes._entity_dict[key].get("name"),
                }
            })
        relationships = []
        for key in graph.relationships._entity_dict:
            relationships.append({
                "key": graph.relationships._entity_dict[key].element_id,
                "source": graph.relationships._entity_dict[key].start_node.element_id,
                "target": graph.relationships._entity_dict[key].end_node.element_id,
                "type": graph.relationships._entity_dict[key].type
            })
        return {
            "nodes": nodes,
            "relationships": relationships
        }
    
    def generate_schema(self):
        self.schema = {
            "node_properties": self.get_node_properties(),
            "relationship_properties": self.get_relationship_properties(),
            "schema": self.get_relationship_schema(),
        }
    
    def export_schema(self, filename):
        with open(filename, "w") as file:
            dump(self.schema, file)
    
    def validate_node_properties(self, node_props):
        res = {}
        for node in node_props:
            cypher_query = f"""
            MATCH (n:{node["labels"]})
            WHERE n IS NOT NULL
            RETURN COUNT(n) > 0 AS node_exists
            """
            exists = self.query(cypher_query)["node_exists"][0]
            if not exists:
                continue
            node_properties = set()
            for prop in node["properties"]:
                cypher_query = f"""
                MATCH (n:{node["labels"]})
                WHERE n.`{prop}` IS NOT NULL
                RETURN COUNT(n) > 0 AS node_property_exists
                """
                exists = self.query(cypher_query)["node_property_exists"][0]
                if exists:
                    node_properties.add(prop)
            res[node["labels"]] = list(node_properties)
        return res

    def validate_relationship_properties(self, rel_props):
        res = {}
        for rel in rel_props:
            cypher_query = f"""
            MATCH ()-[r:{rel["type"]}]-()
            WHERE r IS NOT NULL
            RETURN COUNT(r) > 0 AS relationship_exists
            """
            exists = self.query(cypher_query)["relationship_exists"][0]
            if not exists:
                continue
            rel_properties = set()
            for prop in rel["properties"]:
                cypher_query = f"""
                MATCH ()-[r:{rel["type"]}]-()
                WHERE r.`{prop}` IS NOT NULL
                RETURN COUNT(r) > 0 AS relationship_property_exists
                """
                exists = self.query(cypher_query)["relationship_property_exists"][0]
                if exists:
                    rel_properties.add(prop)
            res[rel["type"]] = list(rel_properties)
        return res

    def validate_relationship_schema(self, rels):
        res = {}
        for rel in rels:
            rel_targets = set()
            for target in rel["target"]:
                cypher_query = f"""
                MATCH (n1:{rel["source"]})-[r:{rel["relationship"]}]-(n2:{target})
                WHERE n1 IS NOT NULL AND r IS NOT NULL AND n2 IS NOT NULL
                RETURN (COUNT(n1) > 0 AND COUNT(r) > 0 AND COUNT(n2) > 0) AS relationship_schema_exists
                """
                exists = self.query(cypher_query)["relationship_schema_exists"][0]
                if exists:
                    rel_targets.add(target)
            if len(rel_targets):
                if rel["source"] not in res:
                    res[rel["source"]] = {}
                res[rel["source"]][rel["relationship"]] = list(rel_targets)
        return res
    
    def query(self, cypher_query, transformation="dataframe"):
        if transformation == "graph":
            res = self.driver.execute_query(cypher_query, routing_=RoutingControl.READ, result_transformer_=Result.graph)
        else:
            res = self.driver.execute_query(cypher_query, routing_=RoutingControl.READ, result_transformer_=Result.to_df)
        return res

    def transform_node_relationship_properties(self, res, res_type):
        if type(res) is str:
            res = self.query(res)["output"].tolist()
        if res_type == "node_properties":
            res = self.validate_node_properties(res)
        elif res_type == "relationship_properties":
            res = self.validate_relationship_properties(res)
        elif res_type == "relationship_schema":
            res = self.validate_relationship_schema(res)
        return res
    
    def get_node_properties(self):
        cypher_query = """
        CALL db.schema.nodeTypeProperties()
        YIELD nodeLabels, propertyName
        WITH head(nodeLabels) AS label, collect(propertyName) AS properties
        RETURN {labels: label, properties: properties} AS output
        """
        return self.transform_node_relationship_properties(cypher_query, "node_properties")
    
    def get_relationship_properties(self):
        cypher_query = """
        CALL db.schema.relTypeProperties()
        YIELD relType, propertyName
        WITH replace(replace(relType, ":`", ""), "`", "") AS type, collect(propertyName) AS properties
        RETURN {type: type, properties: properties} AS output
        """
        return self.transform_node_relationship_properties(cypher_query, "relationship_properties")
    
    def get_relationship_schema(self):
        cypher_query = """
        CALL db.schema.visualization()
        """
        graph = self.query(cypher_query, "graph")
        nodes, relationships = (self.get_graph_schema(graph)[key] for key in ("nodes", "relationships"))
        nodes_map = {n["key"]: n["properties"]["name"] for n in nodes}
        output = [{"source": nodes_map[r["source"]], "relationship": r["type"], "target": nodes_map[r["target"]]} for r in relationships]
        d = OrderedDict()
        for i in output:
            d.setdefault((i["source"], i["relationship"]), set()).add(i["target"])
            d.setdefault((i["target"], i["relationship"]), set()).add(i["source"])
        output = [{"source": k[0], "relationship": k[1], "target": v.pop() if len(v) == 1 else v} for k, v in d.items()]
        for i in output:
            if type(i["target"]) is set:
                i["target"] = list(i["target"])
            else:
                i["target"] = [i["target"]]
        return self.transform_node_relationship_properties(output, "relationship_schema")


if __name__ == "__main__":
    URI = "neo4j://iyp-bolt.ihr.live:7687"
    USER = "neo4j"
    PASSWORD = "password"
    DATABASE = "neo4j"

    db = Neo4jDB(URI, USER, PASSWORD, DATABASE)
    db.generate_schema()
    db.export_schema("neo4j-schema.json")
