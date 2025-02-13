<script setup>
import { ref, onMounted, watch } from "vue";
import * as monaco from "monaco-editor";

const emits = defineEmits(["run", "clear"]);

const props = defineProps(["query", "serveInOutput"]);

const code = ref();
const tab = ref("cypher");
let editor = null;

const runQuery = () => {
  const getValue = editor.getValue();
  if (getValue !== "") {
    emits("run", getValue);
    if (!props.serveInOutput) {
      editor.setValue("");
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

watch(tab, () => {
  monaco.editor.setModelLanguage(editor.getModel(), tab.value);
})

onMounted(() => {
  editor = monaco.editor.create(code.value, {
    value: props.query,
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
