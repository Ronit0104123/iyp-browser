<script setup>
import { ref, inject, onMounted } from "vue";
import InputPanel from "@/components/InputPanel.vue";
import GraphOutput from "@/components/output/GraphOutput.vue";

const IypApi = inject("IypApi");

const emits = defineEmits(["clear"]);

const props = defineProps(["query"]);

const tab = ref("graph");
const splitter = ref(110);
const nodes = ref([]);
const relationships = ref([]);

const runCypher = async (cypher) => {
  const res = await IypApi.run(cypher);
  nodes.value = res.nodes;
  relationships.value = res.relationships;
};

onMounted(() => {
  runCypher(props.query);
});
</script>

<template>
  <div class="output-panel row">
    <InputPanel
      :query="props.query"
      :serve-in-output="true"
      @run="runCypher"
      @clear="emits('clear')"
    />
    <div class="output-container">
      <q-splitter v-model="splitter" disable unit="px">
        <template v-slot:before>
          <q-tabs v-model="tab" dense vertical>
            <q-tab name="graph" label="Graph" icon="timeline" />
            <q-tab name="table" label="Table" icon="table_chart" />
            <q-tab name="explanation" label="Explanation" icon="abc" />
            <q-tab name="code" label="Code" icon="code" />
          </q-tabs>
        </template>
        <template v-slot:after>
          <q-tab-panels v-model="tab" vertical class="output-panels">
            <q-tab-panel name="graph">
              <GraphOutput :nodes="nodes" :relationships="relationships" />
            </q-tab-panel>
            <q-tab-panel name="table">
              <div class="text-h6">Table</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </q-tab-panel>
            <q-tab-panel name="explanation">
              <div class="text-h6">Explanation</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </q-tab-panel>
            <q-tab-panel name="code">
              <div class="text-h6">Code</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
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
