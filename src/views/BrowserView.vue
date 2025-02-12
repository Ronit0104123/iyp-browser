<script setup>
import { ref } from 'vue'
import InputPanel from '@/components/InputPanel.vue'
import OutputPanel from '@/components/OutputPanel.vue'

const initQuery = ref('')
const queries = ref([])

const runQuery = async (query) => {
	queries.value.push(query)
}
</script>

<template>
  <div padding>
    <div class="container">
      <div class="input-container">
        {{initQuery}}
        <InputPanel
          @run="runQuery"
        />
      </div>
      <div class="output-container">
        <div v-for="(query, index) in queries">
          <OutputPanel
            :key="index"
            :query="query"
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
.input-container {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.output-container {
  display: flex;
  flex-direction: column-reverse;
}
</style>