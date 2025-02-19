<script setup>
import { ref, inject, onMounted } from "vue";
import InputPanel from "@/components/InputPanel.vue";
import GraphOutput from "@/components/output/GraphOutput.vue";
import TableOutput from "@/components/output/TableOutput.vue";
import ExplanationOutput from "@/components/output/ExplanationOutput.vue";

const IypApi = inject("IypApi");
const LlmApi = inject("LlmApi");

const emits = defineEmits(["clear"]);

const props = defineProps(["query", "queryTypeInput"]);

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
const errorText = ref("");

const runCypher = async (cypher) => {
  loading.value = true;
  const res = await IypApi.run(cypher);
  if (res["error"] === undefined) {
    nodes.value = res.graph.nodes;
    relationships.value = res.graph.relationships;
    rows.value = res.table.rows;
    columns.value = res.table.columns;
    if (!nodes.value.length) {
      tab.value = "table";
    }
  } else {
    errorText.value = res.error;
    tab.value = "error";
    nodes.value = [];
    relationships.value = [];
    rows.value = [];
    columns.value = [];
    explanationText.value = [];
  }
  loading.value = false;
};

const runLlm = async (text) => {
  loading.value = true;
  const res = await LlmApi.run(text);
  cypherQuery.value = res.cypher;
  explanationText.value = res.explanation;
  runCypher(cypherQuery.value);
  loading.value = false;
};

const run = async (queryInput, queryInputType) => {
  queryType.value = queryInputType;
  errorText.value = "";
  tab.value = "graph";
  if (queryType.value === "cypher") {
    cypherQuery.value = queryInput;
    textQuery.value = "";
    runCypher(cypherQuery.value);
  } else {
    textQuery.value = queryInput;
    runLlm(textQuery.value);
  }
};

onMounted(() => {
  run(props.query, props.queryTypeInput);
});
</script>

<template>
  <div class="output-panel row">
    <InputPanel
      :cypher-input="cypherQuery"
      :text-input="textQuery"
      :active-tab="queryType"
      :serve-in-output="true"
      @run="run"
      @clear="emits('clear')"
    />
    <q-skeleton v-if="loading" width="100%" height="480px" animation="wave" />
    <div v-else class="output-container">
      <q-splitter v-model="splitter" disable unit="px" class="output-tabs">
        <template v-slot:before>
          <q-tabs v-model="tab" dense vertical>
            <q-tab name="graph" label="Graph" v-if="nodes.length" />
            <q-tab name="table" label="Table" v-if="rows.length" />
            <q-tab
              name="explanation"
              label="Explanation"
              v-if="textQuery !== ''"
            />
            <q-tab name="error" label="Error" v-if="errorText !== ''" />
          </q-tabs>
        </template>
        <template v-slot:after>
          <q-tab-panels v-model="tab" vertical class="output-panels">
            <q-tab-panel name="graph" v-if="nodes.length">
              <GraphOutput :nodes="nodes" :relationships="relationships" />
            </q-tab-panel>
            <q-tab-panel name="table" v-if="rows.length">
              <TableOutput :rows="rows" :columns="columns" />
            </q-tab-panel>
            <q-tab-panel name="explanation" v-if="textQuery !== ''">
              <ExplanationOutput :text="explanationText" />
            </q-tab-panel>
            <q-tab-panel name="error" v-if="errorText !== ''">
              <p>{{ errorText }}</p>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </div>
    <div class="row footer">
      <div class="col" style="text-align: left">
        <q-img src="@/assets/logo.svg" style="height: 20px; max-width: 20px" />
        Internet Yellow Pages Browser
      </div>
      <!-- <div class="col" style="text-align: center;">
        GitHub
      </div> -->
      <div class="col" style="text-align: right">
        This work is licensed under
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0"
          target="_blank"
          >CC BY-NC-SA 4.0</a
        >
        <q-img
          src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
          style="height: 15px; max-width: 15px"
        />
        <q-img
          src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
          style="height: 15px; max-width: 15px"
        />
        <q-img
          src="https://mirrors.creativecommons.org/presskit/icons/nc.svg"
          style="height: 15px; max-width: 15px"
        />
        <q-img
          src="https://mirrors.creativecommons.org/presskit/icons/sa.svg"
          style="height: 15px; max-width: 15px"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.output-panel {
  background-color: #f9fcff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.output-container {
  width: 100%;
}
.output-panels {
  height: 480px;
  background-color: #f9fcff;
}
.output-tabs {
  background-color: #ffffff;
}
.footer {
  width: 100%;
  background-color: #263238;
  color: #ffffff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  padding: 1px;
}
.footer,
a {
  color: #ffffff;
}
</style>
