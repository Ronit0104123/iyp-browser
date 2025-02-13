<script setup>
import { ref, inject, onMounted } from "vue";
import InputPanel from "@/components/InputPanel.vue";
import GraphOutput from "@/components/output/GraphOutput.vue";
import TableOutput from "@/components/output/TableOutput.vue";
import ExplanationOutput from "@/components/output/ExplanationOutput.vue";

const IypApi = inject("IypApi");
const LlmApi = inject("LlmApi");

const emits = defineEmits(["clear"]);

const props = defineProps(["query", "queryType"]);

const cypherQuery = ref("");
const textQuery = ref("");
const queryType = ref("");
const tab = ref("graph");
const splitter = ref(110);
const loading = ref(false);
const nodes = ref([]);
const relationships = ref([]);
const rows = ref([]);
const columns = ref([]);
const explanationText = ref("");

const runCypher = async (cypher) => {
  loading.value = true;
  const res = await IypApi.run(cypher);
  nodes.value = res.graph.nodes;
  relationships.value = res.graph.relationships;
  rows.value = res.table.rows;
  columns.value = res.table.columns;
  if (!nodes.value.length) {
    tab.value = "table";
  }
  loading.value = false;
};

const runLlm = async (text) => {
  loading.value = true;
  const res = await LlmApi.run(text);
  cypherQuery.value = res.cypher;
  explanationText.value = res.explanation;
  runCypher(cypherQuery.value)
  loading.value = false;
};

const run = async (queryInput, queryInputType) => {
  queryType.value = queryInputType
  if (queryType.value === "cypher") {
    cypherQuery.value = queryInput
    runCypher(cypherQuery.value);
  } else {
    textQuery.value = queryInput
    runLlm(textQuery.value);
  }
};

onMounted(() => {
  run(props.query, props.queryType)
});
</script>

<template>
  <div class="output-panel row">
    <InputPanel
      :cypher="cypherQuery"
      :text="textQuery"
      :active-tab="queryType"
      :serve-in-output="true"
      @run="run"
      @clear="emits('clear')"
    />
    <q-skeleton v-if="loading" width="100%" height="480px" animation="wave" />
    <div v-else class="output-container">
      <q-splitter v-model="splitter" disable unit="px">
        <template v-slot:before>
          <q-tabs v-model="tab" dense vertical>
            <q-tab
              name="graph"
              label="Graph"
              icon="timeline"
              v-if="nodes.length"
            />
            <q-tab name="table" label="Table" icon="table_chart" />
            <q-tab name="explanation" label="Explanation" icon="abc" />
          </q-tabs>
        </template>
        <template v-slot:after>
          <q-tab-panels v-model="tab" vertical class="output-panels">
            <q-tab-panel name="graph" v-if="nodes.length">
              <GraphOutput :nodes="nodes" :relationships="relationships" />
            </q-tab-panel>
            <q-tab-panel name="table">
              <TableOutput :rows="rows" :columns="columns" />
            </q-tab-panel>
            <q-tab-panel name="explanation">
              <ExplanationOutput />
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </div>
  </div>
</template>

<style scoped>
.output-panel {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 4px;
  border-radius: 4px;
}
.output-container {
  width: 100%;
}
.output-panels {
  height: 480px;
}
</style>
