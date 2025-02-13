<script setup>
import { ref, onMounted, watch } from "vue";
import * as monaco from "monaco-editor";

const emits = defineEmits(["run", "clear"]);

const props = defineProps(["cypher", "text", "activeTab", "serveInOutput"]);

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
        text = ""
      } else {
        cypher = ""
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
})

watch(() => props.cypher, () => {
  cypher = props.cypher;
  if (props.activeTab === "cypher") {
    tab.value = "cypher";
    editor.setValue(cypher);
  }
})

watch(() => props.text, () => {
  text = props.text;
  if (props.activeTab === "text") {
    tab.value = "text";
    editor.setValue(text);
  }
})

onMounted(() => {
  tab.value = "cypher"
  editor = monaco.editor.create(code.value, {
    value: "",
    language: "cypher",
    theme: "vs",
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
  });
  window.addEventListener("hitResult", () => {
    // console.log(e)
  });
});
</script>

<template>
  <div class="input-container row">
    <q-tabs v-model="tab" class="col-auto q-mr-md" vertical dense>
      <q-tab name="cypher" label="Cypher" />
      <q-tab name="text" label="Text" />
    </q-tabs>
    <div ref="code" class="code col q-mr-md"></div>
    <div class="col-auto">
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
  </div>
</template>

<style scoped>
.input-container {
  width: 100%;
  height: 100px;
  padding: 4px;
}
.code {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
