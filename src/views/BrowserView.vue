<script setup>
import InputPanel from '@/components/InputPanel.vue'
import OutputPanel from '@/components/OutputPanel.vue'
</script>

<template>
  <div padding>
    <div class="neo4j-container">
      <div class="input-panel">
        <InputPanel />
      </div>
      <OutputPanel />
    </div>
  </div>
</template>

<style scoped>
.neo4j-container {
  display: flex;
  height: 100vh;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #f9f9f9;
}
.input-panel {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>