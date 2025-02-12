<script setup>
import { ref, onMounted } from "vue";
import * as monaco from "monaco-editor";

const code = ref();
let editor = null;

const emits = defineEmits(["run", "clear"]);

const props = defineProps(["query", "serveInOutput"]);

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
