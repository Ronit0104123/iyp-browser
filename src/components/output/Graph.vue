<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { NVL } from '@neo4j-nvl/base'
import { ZoomInteraction, PanInteraction, DragNodeInteraction } from '@neo4j-nvl/interaction-handlers'

const props = defineProps(['nodes', 'relationships'])

const graph = ref()
let nvl = null

const options = {
	disableTelemetry: true,
  layout: 'forceDirected',
  initialZoom: 1.5,
	renderer: 'canvas'
}

const init = (nodes, relationships) => {
	if (nodes.length) {
		nvl = new NVL(graph.value, nodes, relationships, options)
		nvl.setDisableWebGL(true)
		const zoom = new ZoomInteraction(nvl)
		const pan = new PanInteraction(nvl)
		const drag = new DragNodeInteraction(nvl)
	}
}

watch(props, () => {
	if (nvl) {
		nvl.destroy()
	}
	init(props.nodes, props.relationships)
})

onMounted(async () => {
	init(props.nodes, props.relationships)
})

onUnmounted(() => {
	if (nvl) {
		nvl.destroy()
	}
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