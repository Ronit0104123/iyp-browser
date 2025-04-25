<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import OutputPanel from "@/components/OutputPanel.vue";

// http://localhost:5173/embed/MATCH p = (:AS {asn:2497})--(:Name) RETURN p
const route = useRoute()
const query = ref(route.params.query)
</script>

<template>
  <OutputPanel
    :query="query"
    query-type-input="cypher"
    :disable-input="true"
    :disable-top-bar="true"
  />
</template>

<style scoped>
</style>
