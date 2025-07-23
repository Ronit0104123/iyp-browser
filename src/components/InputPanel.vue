<script setup>
import { ref, onMounted, onBeforeUnmount, watch, inject } from "vue";
import * as monaco from "monaco-editor";
import schema from "@/assets/neo4j-schema.json";
import { autocomplete } from "@neo4j-cypher/language-support";
import Feedback from "./Feedback.vue";

const GlobalVariables = inject("GlobalVariables");

const emits = defineEmits(["run", "clear", "editorHeightChanged"]);

const props = defineProps([
  "cypherInput",
  "textInput",
  "activeTab",
  "serveInOutput",
]);

const code = ref();
const tab = ref("");
let cypher = "";
let text = "";
let editor = null;
const minHeight = 3;
const maxHeight = 10;
const lineHeight = 20;
const padding = 10;
let providerDisposable = null;
const PROVIDER_FLAG = "__cypherProviderAdded";

const updateEditorHeight = () => {
  const lineCount = editor.getModel().getLineCount();
  const newHeight =
    Math.min(
      Math.max(lineCount * lineHeight, minHeight * lineHeight),
      maxHeight * lineHeight,
    ) +
    padding * 2;
  code.value.style.height = `${newHeight}px`;
  emits("editorHeightChanged", newHeight);
  editor.layout();
};

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

onMounted(() => {
  tab.value = "cypher";
  editor = monaco.editor.create(code.value, {
    value: "",
    language: "cypher",
    theme: "vs",
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
    contextmenu: false,
    scrollBeyondLastLine: false,
    lineHeight: lineHeight,
    padding: { top: 10, bottom: 10 },
  });

  let previousLineCount = editor.getModel().getLineCount();

  editor.onDidChangeModelContent(() => {
    const currentLineCount = editor.getModel().getLineCount();
    if (currentLineCount !== previousLineCount) {
      previousLineCount = currentLineCount;
      updateEditorHeight();
    }
  });

  window.addEventListener("hitResult", () => {
    // console.log(e)
  });
  monaco.languages.register({
    id: "cypher",
    extensions: [".cypher"],
    aliases: ["Cypher", "cypher"],
  });
  if(!window[PROVIDER_FLAG]){
    providerDisposable = monaco.languages.registerCompletionItemProvider("cypher", {
      triggerCharacters: [":", ")", "-", "[", "]", ">", "<", "{", "}", "."],
      provideCompletionItems: (model, position) => {
        const textUtilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const split = textUtilPosition.split(/(?=MATCH|OPTIONAL MATCH|MERGE)/gi);
        const lastMatchClause = split.length ? split[split.length - 1] : textUtilPosition;

        const matchNodes = [...lastMatchClause.matchAll(/\(\s*\w*\s*:\s*([A-Za-z0-9_]+)/g)];
        const matchRels = [...lastMatchClause.matchAll(/\[\s*\w*\s*:\s*([A-Za-z0-9_]+)(?=[\s\]\-]|$)/g)];

        const trimmedBeforeCursor = textUtilPosition.trimRight();
        const justOpenedBlock = /\b(?:WHERE\s+NOT\s+EXISTS|CALL|EXISTS|FOREACH\s*\([^)]+\))\s*\{$/.test(trimmedBeforeCursor);
        const genericNodeMatch = textUtilPosition.match(/MATCH\s*\(\s*\{\s*$/);
      
        const nodePropMatch = textUtilPosition.match(
          /(?:\(\s*\w*\s*:\s*[A-Za-z0-9_]+\s*\{\s*([A-Za-z0-9_]*))|\b([A-Za-z][A-Za-z0-9_]*)\.\s*([A-Za-z0-9_]*)$/
        );
        const relPropMatch = textUtilPosition.match(
          /\[\s*\w*\s*:\s*[A-Za-z0-9_]+\s*\{\s*([A-Za-z0-9_]*)$/
        );
        const aliasLabelRE = /\(\s*(\w*)\s*:\s*([A-Za-z0-9_]+)/g;
        const relAliasTypeRE = /\[\s*(\w*)\s*:\s*([A-Za-z0-9_]+)/g;
        const dotPropMatch = textUtilPosition.match(
          /\b([A-Za-z][A-Za-z0-9_]*)\.\s*([A-Za-z0-9_]*)$/
        );
        const chainedNodeMatch = textUtilPosition.match(/\)\s*--\s*\(\s*(\w*\s*:)?\s*[\w]+.*$/);
        const pathAliasMatch = [...textUtilPosition.matchAll(/MATCH\s+(\w+)\s*=\s*\(.*?\)/g)];
        const pathAliases = pathAliasMatch.map(m => m[1]);
        const relWithoutTypePropMatch = textUtilPosition.match(/\[\s*\{\s*([A-Za-z0-9_]*)$/);

        const relInPathMatch = textUtilPosition.match(/\b(\w+)\s+IN\s+relationships\(\s*(\w+)\s*\)/);
        const nodeInPathMatch = textUtilPosition.match(/\b(\w+)\s+IN\s+nodes\(\s*(\w+)\s*\)/);

        const activeNodeLabel = matchNodes.length
        ? matchNodes[matchNodes.length - 1][1]
        : null;

        const activeRelationship = matchRels.length && !chainedNodeMatch
        ? matchRels[matchRels.length - 1][1]
        : null;

        const aliasMap = {};

        for (const m of textUtilPosition.matchAll(aliasLabelRE)) {
          const alias = m[1] || null;
          const label = m[2];
          if (alias) aliasMap[alias] = label;
        }

        for (const m of textUtilPosition.matchAll(relAliasTypeRE)) {
          const alias = m[1] || null;
          const type  = m[2];
          if (alias) aliasMap[alias] = type;
        }

        let relationships = [];
        let targetNodes = [];
        let properties = [];

        if(activeNodeLabel){
          relationships = Object.keys(schema.schema[activeNodeLabel] || {} );
          const connectedVia = schema.schema[activeNodeLabel] || {};
          targetNodes = Object.values(connectedVia).flat();
          targetNodes = [...new Set(targetNodes)];
        }
        if (justOpenedBlock) {
          return { suggestions: [] };
        }
        if (genericNodeMatch) {
          const allProps = Object.values(schema.node_properties || {}).flat();
          properties = [...new Set(allProps)];
        }
        if(activeRelationship && activeNodeLabel){
          targetNodes = schema.schema[activeNodeLabel]?.[activeRelationship] || []; 
        }
        if(activeNodeLabel && nodePropMatch){
          properties = schema.node_properties[activeNodeLabel] || [];
        }
        if(activeRelationship && relPropMatch){
          properties = schema.relationship_properties[activeRelationship] || [];
        }
        if(activeNodeLabel && relWithoutTypePropMatch){
          const relTypes = Object.keys(schema.schema[activeNodeLabel] || {});
          properties = relTypes.flatMap(type => schema.relationship_properties[type] || []);
          properties = [...new Set (properties)];
        }
        if (dotPropMatch) {
          const alias     = dotPropMatch[1];
          if (relInPathMatch && alias === relInPathMatch[1]) {
            const pathVar = relInPathMatch[2];
            let relTypes = []; 
            for (const m of textUtilPosition.matchAll(/MATCH\s+(\w+)\s*=\s*.*?\[:([A-Za-z0-9_]+)/g)) {
              if (m[1] === pathVar) {
                  relTypes.push(m[2]);
              }
            }
            properties = relTypes.flatMap(type => schema.relationship_properties[type] || []);
            properties = [...new Set(properties)];
          } else if (nodeInPathMatch && alias === nodeInPathMatch[1]) {
            const pathVar = nodeInPathMatch[2];
            let nodeLabels = [];
            for (const m of textUtilPosition.matchAll(/MATCH\s+(\w+)\s*=\s*\((?:\w*):([A-Za-z0-9_]+)/g)) {
              if (m[1] === pathVar) {
                  nodeLabels.push(m[2]);
              }
            }
            nodeLabels = [...new Set(nodeLabels)];
            properties = [...new Set(nodeLabels.flatMap(label => schema.node_properties[label] || []))];
          }
          else{
            if (pathAliases.includes(alias)) {
            return { suggestions: [] };
            }
            const labelOrType = aliasMap[alias];
            if (schema.node_properties[labelOrType]) {
              properties = schema.node_properties[labelOrType] || [];
            }
            else if (schema.relationship_properties[labelOrType]) {
              properties = schema.relationship_properties[labelOrType] || [];
            }
          }
        }

        const autocompleteSchema = {
          labels: targetNodes.length > 0 ? targetNodes : Object.keys(schema.node_properties),
          relationshipTypes: relationships.length > 0 ? relationships : Object.keys(schema.relationship_properties),
          propertyKeys: properties.length > 0 ? properties : [
            ...Object.values(schema.node_properties).flat(),
            ...Object.values(schema.relationship_properties).flat(),
          ],
        };

        const completionItems = autocomplete(
          textUtilPosition,
          autocompleteSchema,
        );
        return {
          suggestions: completionItems.map((item) => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: item.label,
            range: item.range,
          })),
        };
      },
    });
  window[PROVIDER_FLAG] = true;
  };
  editor.addAction({
    id: "run",
    label: "Run",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => {
      runQuery();
    },
  });
});
onBeforeUnmount(() => {
  editor?.dispose();
  providerDisposable?.dispose();
});
</script>

<template>
  <div class="input-container row">
    <q-tabs v-model="tab" class="input-language-switcher" vertical dense>
      <q-tab
        v-if="!GlobalVariables.disableCypherInput"
        name="cypher"
        label="Cypher"
      />
      <q-tab
        v-if="!GlobalVariables.disableTextInput"
        name="text"
        label="Text"
        disable
      >
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
          class="full-width"
          @click="runQuery"
        />
        <!-- <q-btn flat square color="red" icon="close" @click="clearQuery" /> -->
      </div>
      <div class="row" style="width: 100%">
        <Feedback />
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  width: 100%;
  padding-top: 4px;
  padding-bottom: 4px;
  background-color: #f9fcff;
}
.input-language-switcher {
  width: 110px;
}
.code {
  width: 100%;
  height: v-bind("minHeight * lineHeight + padding * 2 + 'px'");
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
