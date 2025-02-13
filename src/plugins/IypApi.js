import axios from "axios";
import randomColor from "randomcolor";

/// Base url for api
const IYP_API_BASE = "https://iyp.iijlab.net/iyp/db/neo4j/tx/";
/// Default timeout before api call are considered failed
const DEFAULT_TIMEOUT = 180000;

const IypApi = {
  install: (app) => {
    const axios_base = axios.create({
      baseURL: IYP_API_BASE,
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
      return {
        graph: nvlResultTransformer(response.data.results[0].data),
        table: tableResultTransformer(response.data.results[0].data, query),
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

    const tableResultTransformer = (results, query) => {
      const rows = [];
      const columns = tableResultTransformerColumn(query);
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

    const tableResultTransformerColumn = (cypher) => {
      const returnStatement = cypher.match(/return/i);
      if (returnStatement.length) {
        return [
          {
            name: "index",
            label: "#",
            field: "index",
            align: "left",
          },
        ].concat(
          cypher
            .split(returnStatement[0])[1]
            .split(",")
            .map((val) => {
              const getName = val.replace(/\s+/g, "");
              return {
                name: getName,
                label: getName,
                field: getName,
                align: "left",
              };
            }),
        );
      }
      return [];
    };

    const IypApi = {
      run,
    };
    app.provide("IypApi", IypApi);
  },
};

export { IypApi };
