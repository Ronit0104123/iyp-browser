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

const graph = ref();
const properties = ref({});
const selectedElement = ref({
  nodeOrRelationship: "",
  id: "",
  type: "",
  color: "",
  clicked: false,
});
const hideProperties = ref(false);
let nvl = null;

const options = {
  disableTelemetry: true,
  layout: "forceDirected",
  initialZoom: 1.5,
  renderer: "canvas",
};

const updateNvlElementselectedElement = (element) => {
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
    nvl.getNodeById;
    nvl.setDisableWebGL(true);
    nvl.getNodeById;
    new ZoomInteraction(nvl);
    new PanInteraction(nvl);
    new DragNodeInteraction(nvl);
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
</script>

<template>
  <div class="graph">
    <div ref="graph"></div>
    <q-card class="overview">
      <q-card-section>
        <div v-if="selectedElement.nodeOrRelationship === 'node'">
          <div class="text-subtitle1">Node properties</div>
          <q-badge
            rounded
            :label="selectedElement.type"
            text-color="black"
            :style="`background-color: ${selectedElement.color};`"
          />
        </div>
        <div v-else-if="selectedElement.nodeOrRelationship === 'relationship'">
          <div class="text-subtitle1">Relationship properties</div>
          <q-badge
            :label="selectedElement.type"
            text-color="white"
            style="background-color: #848484"
          />
        </div>
        <div v-else>
          <div class="text-subtitle1">Overview</div>
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
</style>
