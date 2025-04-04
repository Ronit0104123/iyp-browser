<script setup>
import { ref, onMounted, onUnmounted, watch, inject } from "vue";
import { NVL } from "@neo4j-nvl/base";
import {
  ZoomInteraction,
  PanInteraction,
  DragNodeInteraction,
  HoverInteraction,
  ClickInteraction,
} from "@neo4j-nvl/interaction-handlers";

const props = defineProps(["nodes", "relationships"]);
const Neo4jApi = inject("Neo4jApi");
const graph = ref();
const properties = ref({});
const selectedElement = ref({
  nodeOrRelationship: "",
  id: "",
  type: "",
  color: "",
  clicked: false,
});

const nodeTypeColors = ref({});

const hideOverviewBtn = ref(false);
const hideOverviewBtnIcon = ref("keyboard_arrow_up");
const overview = ref();
let nvl = null;
// console.log("nodesprop", props.nodes)
const options = {
  disableTelemetry: true,
  layout: "forceDirected",
  initialZoom: 1,
  renderer: "canvas",
  maxZoom: 3,
  minZoom: 1,
};

const hideOverview = () => {
  hideOverviewBtn.value = !hideOverviewBtn.value;
  if (hideOverviewBtn.value) {
    overview.value.$el.style.height = "auto";
    hideOverviewBtnIcon.value = "keyboard_arrow_down";
  } else {
    overview.value.$el.style.width = "250px";
    overview.value.$el.style.height = "100%";
    hideOverviewBtnIcon.value = "keyboard_arrow_up";
  }
};

const zoomIn = () => {
  nvl.setZoom(nvl.getScale() + 0.5);
};

const zoomOut = () => {
  nvl.setZoom(nvl.getScale() - 0.5);
};

const reset = () => {
  nvl.resetZoom();
};

const fetchConnectedNodes = async (nodeId) => {
  const cypher = `
      MATCH (n)-[r]->(m)
      WHERE ID(n) = ${nodeId}
      RETURN m
    `
    const res = await Neo4jApi.run(cypher)
    return res.graph.nodes
}

const updateNvlElementselectedElement = async (element) => {
  if (!element && selectedElement.value.clicked) {
    if (selectedElement.value.nodeOrRelationship === "node") {
      const oldNode = nvl.getNodeById(selectedElement.value.id);
      oldNode.selected = false;
      nvl.addAndUpdateElementsInGraph([oldNode], []);
    } else if (selectedElement.value.nodeOrRelationship === "relationship") {
      const oldRelationship = nvl.getRelationshipById(selectedElement.value.id);
      oldRelationship.selected = false;
      nvl.addAndUpdateElementsInGraph([], [oldRelationship]);
    }
    selectedElement.value.id = "";
    selectedElement.value.nodeOrRelationship = "";
    selectedElement.value.type = "";
    selectedElement.value.color = "";
    selectedElement.value.clicked = false;
    properties.value = {};
  } else if (element && selectedElement.value.id === "") {
    properties.value = element.properties;
    element.selected = true;
    if (element.nodeOrRelationship === "node") {
      nvl.addAndUpdateElementsInGraph([element], []);
      const newNodes = await fetchConnectedNodes(element.id)
      nvl.addAndUpdateElementsInGraph([...newNodes], [])
    } else {
      nvl.addAndUpdateElementsInGraph([], [element]);
    }
    selectedElement.value.id = element.id;
    selectedElement.value.nodeOrRelationship = element.nodeOrRelationship;
    selectedElement.value.type = element.type;
    selectedElement.value.color = element.color;
  } else if (element && element?.id !== selectedElement.value.id) {
    properties.value = element.properties;
    element.selected = true;
    if (selectedElement.value.nodeOrRelationship === "node") {
      const oldNode = nvl.getNodeById(selectedElement.value.id);
      oldNode.selected = false;
      if (element.nodeOrRelationship === "node") {
        nvl.addAndUpdateElementsInGraph([oldNode, element], []);
      } else {
        nvl.addAndUpdateElementsInGraph([oldNode], [element]);
      }
    } else if (selectedElement.value.nodeOrRelationship === "relationship") {
      const oldRelationship = nvl.getRelationshipById(selectedElement.value.id);
      oldRelationship.selected = false;
      nvl.addAndUpdateElementsInGraph([], [oldRelationship]);
      if (element.nodeOrRelationship === "node") {
        nvl.addAndUpdateElementsInGraph([element], [oldRelationship]);
      } else {
        nvl.addAndUpdateElementsInGraph([], [oldRelationship, element]);
      }
    } else {
      if (element.nodeOrRelationship === "node") {
        nvl.addAndUpdateElementsInGraph([element], []);
      } else {
        nvl.addAndUpdateElementsInGraph([], [element]);
      }
    }
    selectedElement.value.id = element.id;
    selectedElement.value.nodeOrRelationship = element.nodeOrRelationship;
    selectedElement.value.type = element.type;
    selectedElement.value.color = element.color;
  }
};

const init = (nodes, relationships) => {
  if (nodes.length) {
    nvl = new NVL(graph.value, nodes, relationships, options);
    props.nodes.forEach((node) => {
      if (!nodeTypeColors.value[node.type]) {
        nodeTypeColors.value[node.type] = node.color;
      }
    });

    nvl.setDisableWebGL(true);
    new ZoomInteraction(nvl);
    new PanInteraction(nvl);
    new DragNodeInteraction(nvl).updateCallback("onDrag", (nodes) => {});
    new HoverInteraction(nvl).updateCallback(
      "onHover",
      (element, hitElements, event) => {
        if (!selectedElement.value.clicked) {
          if (element) {
            properties.value = element.properties;
            selectedElement.value.id = "";
            selectedElement.value.nodeOrRelationship =
              element.nodeOrRelationship;
            selectedElement.value.type = element.type;
            selectedElement.value.color = element.color;
          } else {
            properties.value = {};
            selectedElement.value.id = "";
            selectedElement.value.nodeOrRelationship = "";
            selectedElement.value.type = "";
            selectedElement.value.color = "";
          }
        }
      },
    );
    const clickInteraction = new ClickInteraction(nvl);
    clickInteraction.updateCallback("onNodeClick", (node) => {
      if (node) {
        selectedElement.value.clicked = true;
        updateNvlElementselectedElement(node);
      }
    });
    clickInteraction.updateCallback("onRelationshipClick", (relationship) => {
      if (relationship) {
        selectedElement.value.clicked = true;
        updateNvlElementselectedElement(relationship);
      }
    });
    clickInteraction.updateCallback("onCanvasClick", (canvas) => {
      selectedElement.value.clicked = true;
      updateNvlElementselectedElement();
    });
  }
};

watch(props, () => {
  if (nvl) {
    nvl.destroy();
  }
  init(props.nodes, props.relationships);
});

onMounted(async () => {
  init(props.nodes, props.relationships);
});

onUnmounted(() => {
  if (nvl) {
    nvl.destroy();
  }
});

const updateNodeColor = (type, color) => {
  nodeTypeColors.value[type] = color;
  const nodesToUpdate = nvl.getNodes().filter((n) => n.type === type);
  nodesToUpdate.forEach((n) => {
    n.color = color;
  });
  nvl.addAndUpdateElementsInGraph(nodesToUpdate, []);
};

</script>

<template>
  <div class="graph">
    <div ref="graph"></div>
    <q-card class="overview" ref="overview">
      <q-bar class="fixed-top overview-bar">
        <div class="row justify-between" style="width: 100%">
          <q-btn icon="zoom_in" flat square color="white" @click="zoomIn" />
          <q-btn icon="zoom_out" flat square color="white" @click="zoomOut" />
          <q-btn
            icon="center_focus_strong"
            flat
            square
            color="white"
            @click="reset"
          />
          <q-btn
            :icon="hideOverviewBtnIcon"
            flat
            square
            color="white"
            @click="hideOverview"
          />
        </div>
      </q-bar>
      <q-card-section style="padding-top: 0" v-if="!hideOverviewBtn">
        <div class="fixed-top overview-info">
          <div v-if="selectedElement.nodeOrRelationship === 'node'">
            <div class="text-subtitle1">Node properties</div>
            <q-badge
              rounded
              :label="selectedElement.type"
              text-color="black"
              :style="`background-color: ${selectedElement.color};`"
            />
          </div>
          <div
            v-else-if="selectedElement.nodeOrRelationship === 'relationship'"
          >
            <div class="text-subtitle1">Relationship properties</div>
            <q-badge
              :label="selectedElement.type"
              text-color="white"
              style="background-color: #848484"
            />
          </div>
          <div v-else>
            <div class="text-subtitle1">Overview</div>
            <div class="text-subtitle2">Node labels</div>
            <div>
              <div
                v-for="(node, index) in nodes
                  .map((el) => ({ type: el.type, color: el.color }))
                  .filter(
                    (value, index, self) =>
                      index === self.findIndex((t) => t.type === value.type),
                  )"
                :key="index"
                class="row items-center q-mb-sm"
              >
                <q-badge
                  :label="node.type"
                  text-color="black"
                  :style="`background-color: ${nodeTypeColors[node.type]}; margin-right: 8px;`"
                />
                <input
                  type="color"
                  v-model="nodeTypeColors[node.type]"
                  @input="(e) => updateNodeColor(node.type, e.target.value)"
                  style="width: 30px; height: 20px; padding: 0; border: none; background:transparent"
                />
              </div>
            </div>

            <div class="text-subtitle2">Relationship types</div>
            <div>
              <span
                class="q-mr-sm"
                v-for="(relType, index) in [
                  ...new Set(relationships.map((el) => el.type)),
                ]"
                :key="index"
              >
                <q-badge
                  :label="relType"
                  text-color="white"
                  style="background-color: #848484"
                />
              </span>
            </div>
          </div>
        </div>
        <q-markup-table flat wrap-cells dense>
          <thead></thead>
          <tbody>
            <tr v-for="(property, key, index) in properties" :key="index">
              <td class="text-bold text-left overview-property-key">
                {{ key }}
              </td>
              <td class="text-left overview-property-value">{{ property }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.graph {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.overview {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 250px;
  height: 100%;
  border-top-left-radius: 4px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  overflow-y: auto;
}
.overview-property-key {
  max-width: 70px;
  word-wrap: break-word;
  padding-left: 0px !important;
}
.overview-property-value {
  max-width: 120px;
  word-wrap: break-word;
  padding-right: 0px !important;
}
.overview-bar {
  position: sticky;
  top: 0px;
  z-index: 1;
  height: 30px;
  background-color: #263238;
}
.overview-info {
  position: sticky;
  top: 30px;
  z-index: 1;
  background-color: white;
}
</style>
