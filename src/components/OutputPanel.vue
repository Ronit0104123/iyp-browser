<script setup>
import { ref } from 'vue'
import InputPanel from '@/components/InputPanel.vue'
import Graph from '@/components/output/Graph.vue'

const tab = ref('graph')
const splitter = ref(110)
</script>

<template>
	<div class="output-panel row">
		<InputPanel />
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
							<Graph />
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