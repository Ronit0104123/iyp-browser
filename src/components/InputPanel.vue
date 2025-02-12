<script setup>
import { ref, onMounted } from 'vue'
import * as monaco from 'monaco-editor'

const code = ref()

onMounted(() => {
  const editor = monaco.editor.create(code.value, {
    value: 'MATCH p = (:AS {asn:2497})--(:Name) RETURN p',
    language: 'cypher',
    theme: 'vs',
    minimap: {
      enabled: false
    },
    automaticLayout: true
  })
})
</script>

<template> 
  <div class="input-container row">
    <div ref="code" class="code col q-mr-md"></div>
     <div class="col-auto">
      <q-btn flat square color="primary" icon="play_arrow" class="q-mr-md" />
      <q-btn flat square color="red" icon="close" />
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