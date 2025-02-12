<script setup>
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { NVL } from '@neo4j-nvl/base'
import { ZoomInteraction, PanInteraction, DragNodeInteraction } from '@neo4j-nvl/interaction-handlers'

const iyp_api = inject('iyp_api')

const graph = ref()
let nvl = null

const options = {
	disableTelemetry: true,
  layout: 'forceDirected',
  initialZoom: 1.5,
	renderer: 'canvas'
}

onMounted(async () => {
	const { nodes, relationships } = await iyp_api.run('MATCH p = (:AS {asn:2497})--(:Name) RETURN p')
	nvl = new NVL(graph.value, nodes, relationships, options)
	const zoom = new ZoomInteraction(nvl)
	const pan = new PanInteraction(nvl)
	const drag = new DragNodeInteraction(nvl)
})

onUnmounted(() => {
	nvl.destroy()
})
</script>

<template>
	<div ref="graph-container row">
		<div class="graph">
			<div ref="graph"></div>
		</div>
	</div>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
}
.graph {
  width: 100%;
  height: 460px;
}
</style>