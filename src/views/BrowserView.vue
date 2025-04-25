<script setup>
import { ref, watch } from "vue";
import InputPanel from "@/components/InputPanel.vue";
import OutputPanel from "@/components/OutputPanel.vue";
import { uid, copyToClipboard } from "quasar";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const queries = ref(route.query.session ? JSON.parse(route.query.session) : []);
const outputPanel = ref();

const runQuery = (query, queryType) => {
  const uuid = uid();
  queries.value.push({ query, queryType, uuid });
};

const clearQuery = (uuid) => {
  queries.value = queries.value.filter((query) => query.uuid !== uuid);
};

const shareQuery = (query) => {
  const urlToShare = `${window.location.origin}/?session=[${JSON.stringify(query)}]`;
  copyToClipboard(urlToShare);
};

const pushRoute = () => {
  router.push({
    replace: true,
    query: Object.assign({}, route.query, {
      session: JSON.stringify(queries.value),
    }),
  })
};

watch(queries, () => {
  pushRoute();
}, { deep: true });
</script>

<template>
  <div class="container">
    <div class="browser-input-container">
      <InputPanel active-tab="cypher" @run="runQuery" />
    </div>
    <div class="browser-output-container">
      <div v-for="query in queries" :key="query.uuid">
        <OutputPanel
          ref="outputPanel"
          :query="query.query"
          :query-type-input="query.queryType"
          :disable-input="false"
          :disable-top-bar="false"
          :disable-resizer="false"
          @clear="clearQuery(query.uuid)"
          @share="shareQuery(query)"
          style="height: 540px;"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #f9f9f9;
}
.browser-input-container {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.browser-output-container {
  display: flex;
  flex-direction: column-reverse;
  gap: 16px;
}
</style>
