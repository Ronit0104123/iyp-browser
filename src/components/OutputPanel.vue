<script setup>
import { ref, inject, onMounted } from "vue";
import InputPanel from "@/components/InputPanel.vue";
import GraphOutput from "@/components/output/GraphOutput.vue";
import TableOutput from "@/components/output/TableOutput.vue";
import ExplanationOutput from "@/components/output/ExplanationOutput.vue";
import { version } from "../../package.json";
import interact from "interactjs";
import { useRoute } from 'vue-router';
import {
  QBtn,
  QTooltip,
  copyToClipboard
} from 'quasar'
const Neo4jApi = inject("Neo4jApi");
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
const outputPanel = ref();

const runCypher = async (cypher) => {
  loading.value = true;
  const res = await Neo4jApi.run(cypher);
  if (res["error"] === undefined) {
    nodes.value = res.graph.nodes;
    relationships.value = res.graph.relationships;
    //console.log("nodes", nodes.value)
    //console.log("ROWS", res.table.rows)
    //console.log("COLUMNS", res.table.columns)

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

const route = useRoute();

const getShareableUrl = () => {
  let baseUrl = `${window.location.origin}/share`;
  let encodedQuery = encodeURIComponent(cypherQuery.value);
  let encodedType = encodeURIComponent(queryType.value);
  let shareUrl = `${baseUrl}?q=${encodedQuery}&type=${encodedType}`;
  window.open(shareUrl, '_blank');
  return shareUrl;
};


const isIframeMode = route.name === "IframeOutputPanel";

const openIframe = () => {
  let baseUrl = `${window.location.origin}/iframe`;
  let encodedQuery = encodeURIComponent(cypherQuery.value);
  let encodedType = encodeURIComponent(queryType.value);
  let iframeUrl = `${baseUrl}?q=${encodedQuery}&type=${encodedType}`;
  window.open(iframeUrl, '_blank');
};



const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    outputPanel.value.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
  isFullscreen.value = !isFullscreen.value;
};



onMounted(() => {
  run(props.query, props.queryTypeInput);
  interact(outputPanel.value)
    .origin("self")
    .resizable({
      edges: { top: false, left: false, bottom: true, right: false },
      inertia: true,
      listeners: {
        move: (event) => {
          outputPanel.value.style.height = `${event.rect.height}px`;
        },
      },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { height: 540 },
          max: { height: 800 },
        }),
      ],
    });
});
</script>

<template>
  <div class="output-panel" ref="outputPanel">
    <InputPanel
      v-if="!isIframeMode"
      :cypher-input="cypherQuery"
      :text-input="textQuery"
      :active-tab="queryType"
      :serve-in-output="true"
      @run="run"
      @clear="emits('clear')"
    />
    <q-skeleton v-if="loading" width="100%" height="100%" animation="wave" />
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
            <q-tab-panel
              name="graph"
              v-if="nodes.length"
              class="output-tab-panel"
            >
              <GraphOutput :nodes="nodes" :relationships="relationships" />
              <QBtn class="share" dense flat icon="link" @click="copyToClipboard(getShareableUrl())">
                <QTooltip> Copy Query URL </QTooltip>
              </QBtn>
              <QBtn dense flat icon="open_in_new" @click="openIframe">
                <QTooltip> Share as iframe </QTooltip>
              </QBtn>
              <QBtn dense flat icon="fullscreen" @click="toggleFullscreen">
                <QTooltip>{{ isFullscreen ? "Exit Fullscreen" : "Fullscreen" }}</QTooltip>
              </QBtn>
            </q-tab-panel>
            <q-tab-panel
              name="table"
              v-if="rows.length"
              class="output-tab-panel"
            >
              <QBtn dense flat icon="fullscreen" @click="toggleFullscreen">
                  <QTooltip>{{ isFullscreen ? "Exit Fullscreen" : "Fullscreen" }}</QTooltip>
              </QBtn>
              <TableOutput :rows="rows" :columns="columns" />
            </q-tab-panel>
            <q-tab-panel
              name="explanation"
              v-if="textQuery !== ''"
              class="output-tab-panel"
            >
              <ExplanationOutput :text="explanationText" />
            </q-tab-panel>
            <q-tab-panel
              name="error"
              v-if="errorText !== ''"
              class="output-tab-panel"
            >
              <p>{{ errorText }}</p>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </div>
    <div class="footer">
      <div class="row">
        <div class="col" style="text-align: left">
          <q-img
            src="@/assets/logo.svg"
            style="height: 20px; max-width: 20px"
          />
          Internet Yellow Pages Browser
          <a
            :href="`https://github.com/InternetHealthReport/iyp-browser/releases/tag/v${version}`"
            target="_blank"
          >
            <q-badge color="red">v{{ version }}</q-badge>
          </a>
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
  </div>
</template>

<style scoped>
.output-panel {
  display: flex;
  flex-direction: column;
  background-color: #f9fcff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  height: 540px;
  touch-action: none;
}
.output-container {
  width: 100%;
  height: 0;
  flex: 1;
  overflow-y: auto;
}
.output-panels {
  background-color: #f9fcff;
  height: 100%;
  box-sizing: border-box;
  padding: 10px;
}
.output-tabs {
  background-color: #ffffff;
  height: 100%;
}
.footer {
  width: 100%;
  background-color: #263238;
  color: #ffffff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  padding: 1px;
  height: 24px;
}
.footer,
a {
  color: #ffffff;
}
.output-tab-panel {
  padding: 0px;
}


.share{
  
}
</style>
