<script setup>
import { ref, onMounted, watch, inject } from "vue";
import * as monaco from "monaco-editor";
import schema from "@/assets/neo4j-schema.json";
import { autocomplete } from "@neo4j-cypher/language-support";
import Feedback from "./Feedback.vue";
import interact from "interactjs";

const emits = defineEmits(["run", "clear"]);
const Neo4jApi = inject("Neo4jApi");

const props = defineProps([
  "cypherInput",
  "textInput",
  "activeTab",
  "serveInOutput",
]);

const inputPanel = ref();
const code = ref();
const tab = ref("");
let cypher = "";
let text = "";
let editor = null;

const runQuery = () => {
  const getValue = editor.getValue();
  if (getValue !== "") {
    emits("run", getValue, tab.value);
    if (props.serveInOutput) {
      if (tab.value === "cypher") {
        text = "";
      }
    } else {
      editor.setValue("");
      cypher = "";
      text = "";
    }
  }
};

const clearQuery = () => {
  if (!props.serveInOutput) {
    editor.setValue("");
    cypher = "";
    text = "";
    tab.value = "cypher";
  } else {
    emits("clear");
  }
};

watch(tab, (newTab, oldTab) => {
  if (newTab === "text" && oldTab === "cypher") {
    cypher = editor.getValue();
    editor.setValue(text);
  } else if (newTab === "cypher" && oldTab === "text") {
    text = editor.getValue();
    editor.setValue(cypher);
  }
  monaco.editor.setModelLanguage(editor.getModel(), tab.value);
});

watch(
  () => props.cypherInput,
  () => {
    cypher = props.cypherInput;
    if (props.activeTab === "cypher") {
      tab.value = "cypher";
      editor.setValue(cypher);
    }
  },
);

watch(
  () => props.textInput,
  () => {
    text = props.textInput;
    if (props.activeTab === "text") {
      tab.value = "text";
      editor.setValue(text);
    }
  },
);

onMounted(async () => {
  tab.value = "cypher";
  interact(inputPanel.value)
    .origin("self")
    .resizable({
      edges: { bottom: true },
      inertia: true,
      listeners: {
        move(event) {
          inputPanel.value.style.height = `${event.rect.height}px`;
        },
      },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { height: 100 },
          max: { height: 300  },
        }),
      ],
    });
  editor = monaco.editor.create(code.value, {
    value: "",
    language: "cypher",
    theme: "vs",
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
    contextmenu: false,
  });
  window.addEventListener("hitResult", () => {
    // console.log(e)
  });
  monaco.languages.register({
    id: "cypher",
    extensions: [".cypher"],
    aliases: ["Cypher", "cypher"],
  });

  console.log("Schema", schema)
  const res = await Neo4jApi.run("CALL schema.visualization()");
  const res2 = await Neo4jApi.run('MATCH (n)-[r]-(m) RETURN DISTINCT labels(n), type(r), labels(m)');
  console.log("schema2", res)
  console.log("Cypher-approach ", res2) 

  monaco.languages.registerCompletionItemProvider("cypher", {
    triggerCharacters: [' ', ':', '(', ')', '{', '}', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    provideCompletionItems: async (model, position) => {
      const textUtilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

    let matchNode = textUtilPosition.match(/:\s*([A-Za-z0-9_]+)/);
    let matchRel = textUtilPosition.match(/\[\s*:\s*([A-Za-z0-9_]+)/);

    let dynamicSuggestions = [];

    try {
      if (matchNode && matchNode[1].length > 1) {

        const nodeLabel = matchNode[1];
        const res = await Neo4jApi.run(
          `MATCH (n:\`${nodeLabel}\`)-[r]-(m) RETURN DISTINCT type(r) AS rel, labels(m) AS node`
        );

        console.log("matchNode", matchNode)
        console.log("res", res)

        res.table.rows.forEach((item) => {
          dynamicSuggestions.push({
            label: `${item.rel} -> ${item.node}`,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: `${item.rel} -> (${item.node})`,
          });
        });

      } else if (matchRel) {

        const relType = matchRel[1];
        const res = await Neo4jApi.run(
          `MATCH (n)-[r:\`${relType}\`]-(m) RETURN DISTINCT labels(n) AS source, labels(m) AS target`
        );

        res.table.rows.forEach((item) => {
          dynamicSuggestions.push({
            label: `${item.source} -[${relType}]- ${item.target}`,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: `(${item.source})-[:${relType}]-(${item.target})`,
          });
        });
      }
    } catch (err) {
      console.error("AutoComplete Query Error: ", err);
    }
      const completionItems = autocomplete(textUtilPosition, schema);
      const staticSuggestions = completionItems.map((item) => ({
      label: item.label,
      kind: item.kind,
      insertText: item.label,
      range: item.range,
      }));
      console.log(staticSuggestions)
    return {
      suggestions: [...staticSuggestions, ...dynamicSuggestions],
    };

    },
  }),
  editor.addAction({
    id: "run",
    label: "Run",
    keybindings: [
      monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
    ],
    run: () => {
      runQuery();
    },
  });
});
</script>

<template>
  <div class="input-container row" ref="inputPanel">
    <q-tabs v-model="tab" class="input-language-switcher" vertical dense>
      <q-tab name="cypher" label="Cypher" />
      <q-tab name="text" label="Text" disable>
        <q-badge>Coming Soon</q-badge>
      </q-tab>
    </q-tabs>
    <div ref="code" class="code col q-mr-md"></div>  
    <div class="col-auto q-mr-md">
      <div class="row q-mb-sm">
        <q-btn
          flat
          square
          color="primary"
          icon="play_arrow"
          class="q-mr-md"
          @click="runQuery"
        />
        <q-btn flat square color="red" icon="close" @click="clearQuery" />
      </div>
      <div class="row justify-center" style="width: 100%">
        <Feedback />
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  width: 100%;
  height: 100px;
  padding-top: 4px;
  padding-bottom: 4px;
  background-color: #f9fcff;
}
.input-language-switcher {
  width: 110px;
}
.code {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
