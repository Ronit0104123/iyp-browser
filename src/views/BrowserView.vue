<script setup>
import { ref, onMounted } from "vue";
import InputPanel from "@/components/InputPanel.vue";
import OutputPanel from "@/components/OutputPanel.vue";
import { uid } from "quasar";

import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const queries = ref([]);
const runQuery = (query, queryType) => {
  const uuid = uid();
  queries.value.push({ query, queryType, uuid });
  const currentQueries = queries.value.map((q) => q.query);
  const queryParam = JSON.stringify(currentQueries); 
  router.push({
    path: '/',
    query: {
      q: queryParam
    }
  });
};

const updateURLFromQueries = () => {
  const currentQueries = queries.value.map((q) => q.query);
  const queryParam = JSON.stringify(currentQueries);
  router.replace({
    path: '/',
    query: { q: queryParam}
  });
};

const clearQuery = (uuid) => {

  queries.value = queries.value.filter((query) => query.uuid !== uuid);

  if (queries.value.length === 0) {
    window.location.replace('/');
  } else {
    updateURLFromQueries();
  } 
};

onMounted(() => {
  const qParam = route.query.q;
  if (qParam) {
    const parsedQueries = JSON.parse(qParam);
    parsedQueries.forEach((queryString) => {
      runQuery(queryString, "cypher");
    });
  }
});

</script>

<template>
  <div class="container">
    <div class="browser-input-container">
      <InputPanel active-tab="cypher" @run="runQuery" />
    </div>
    <div class="browser-output-container">
      <div v-for="query in queries" :key="query.uuid">
        <OutputPanel
          :query="query.query"
          :query-type-input="query.queryType"
          @clear="clearQuery(query.uuid)"
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
