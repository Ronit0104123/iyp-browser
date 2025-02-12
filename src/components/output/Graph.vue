<script setup>
import { ref, onMounted, inject } from 'vue'
import { NVL } from '@neo4j-nvl/base'

const iyp_api = inject('iyp_api')

const graph = ref()
let nvl = null

const options = {
	disableTelemetry: true,
  layout: 'forceDirected',
  initialZoom: 0.5,
	renderer: 'canvas'
}
const callbacks = {
  onLayoutDone: () => {
		console.log(nvl)
	}
}

onMounted(async () => {
	const { nodes, relationships } = await iyp_api.run('MATCH p = (:AS {asn:2497})--(:Name) RETURN p')
	console.log(nodes)
	console.log(relationships)
	// const { nodes, relationships } = await executeQuery('MATCH p = (:AS {asn:2497})--(:Name) RETURN p')
	// console.log(nodes, relationships)
	nvl = new NVL(graph.value, nodes, relationships, options, callbacks)
	// console.log(nvl)
})
</script>

<template>
	<div ref="graph-container row">
		<div ref="graph" class="graph"></div>
	</div>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 500px;
}
.graph {
  width: 100%;
  height: 500px;
}
</style>