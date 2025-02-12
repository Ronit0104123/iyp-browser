<script setup>
import { ref } from 'vue'
import InputPanel from '@/components/InputPanel.vue'
import OutputPanel from '@/components/OutputPanel.vue'
import { uid } from 'quasar'

const queries = ref([])

const runQuery = (query) => {
  const uuid = uid()
	queries.value.push({ query, uuid })
}

const clearQuery = (uuid) => {
  queries.value = queries.value.filter((query) => query.uuid !== uuid)
}
</script>

<template>
  <div padding>
    <div class="container">
      <div class="browser-input-container">
        <InputPanel
          @run="runQuery"
        />
      </div>
      <div class="browser-output-container">
        <div v-for="query in queries" :key="query.uuid">
          <OutputPanel
            :query="query.query"
            @clear="clearQuery(query.uuid)"
          />
        </div>
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