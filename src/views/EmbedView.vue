<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import OutputPanel from "@/components/OutputPanel.vue";

const route = useRoute();
const query = ref(JSON.parse(route.query.session)[0]);
</script>

<template>
  <OutputPanel
    :query="query.query"
    :query-type-input="query.queryType"
    :disable-input="true"
    :disable-top-bar="true"
    :disable-resizer="true"
    class="fullscreen"
  />
</template>

<style scoped></style>
