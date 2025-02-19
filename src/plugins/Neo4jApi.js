import axios from "axios";
import randomColor from "randomcolor";

/// Base url for neo4j api
const NEO4J_API_BASE = "https://iyp.iijlab.net/iyp/db/neo4j/tx/";
/// Default timeout before api call are considered failed
const DEFAULT_TIMEOUT = 180000;

const Neo4jApi = {
  install: (app) => {
    const axios_base = axios.create({
      baseURL: NEO4J_API_BASE,
      timeout: DEFAULT_TIMEOUT,
    });

    const run = async (query) => {
      let response = await axios_base.post("", {
        statements: [
          {
            statement: query,
            resultDataContents: ["row", "graph"],
          },
        ],
      });
      if (response.data.errors.length) {
        return {
          error: response.data.errors[0].message,
        };
      }
      return {
        graph: nvlResultTransformer(response.data.results[0].data),
        table: tableResultTransformer(
          response.data.results[0].columns,
          response.data.results[0].data,
        ),
      };
    };

    const nvlResultTransformer = (results) => {
      const colorMap = new Map();
      const nodes = [];
      const relationships = [];
      results.forEach((row) => {
        if (row["graph"] !== undefined) {
          row["graph"].nodes.forEach((node) => {
            node = nvlResultTransformerNode(node, colorMap);
            if (nodes.indexOf(node) === -1) {
              nodes.push(node);
            }
          });
          row["graph"].relationships.forEach((relationship) => {
            relationship = nvlResultTransformerRelationship(relationship);
            if (relationships.indexOf(relationship) === -1) {
              relationships.push(relationship);
            }
          });
        }
      });
      return { nodes, relationships };
    };

    const nvlResultTransformerNode = (node, colorMap) => {
      const nodeType = node.labels[0];
      if (!colorMap.has(nodeType)) {
        colorMap.set(nodeType, randomColor());
      }
      return {
        id: node.id,
        caption: String(node.properties[Object.keys(node.properties)[0]]),
        color: colorMap.get(nodeType),
      };
    };

    const nvlResultTransformerRelationship = (relationship) => {
      return {
        id: relationship.elementId,
        from: relationship.startNode,
        to: relationship.endNode,
        caption: relationship.type,
      };
    };

    const tableResultTransformer = (header, results) => {
      const rows = [];
      const columns = tableResultTransformerColumn(header);
      if (columns.length) {
        results.forEach((row, rowIndex) => {
          if (row["row"] !== undefined) {
            const returnedRow = {
              index: rowIndex + 1,
            };
            row["row"].forEach((val, valIndex) => {
              returnedRow[columns[valIndex + 1].name] = JSON.stringify(val);
            });
            rows.push(returnedRow);
          }
        });
      }
      return { rows, columns };
    };

    const tableResultTransformerColumn = (columns) => {
      if (columns.length) {
        return [
          {
            name: "index",
            label: "#",
            field: "index",
            align: "left",
          },
        ].concat(
          columns.map((val) => {
            return {
              name: val,
              label: val,
              field: val,
              align: "left",
            };
          }),
        );
      }
      return [];
    };

    const Neo4jApi = {
      run,
    };
    app.provide("Neo4jApi", Neo4jApi);
  },
};

export { Neo4jApi };
