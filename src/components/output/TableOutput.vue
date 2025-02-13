<script setup>
import { ref } from "vue";

const props = defineProps(["rows", "columns"]);
</script>

<template>
	<q-table
		flat
		:rows="props.rows"
		:columns="props.columns"
		row-key="index"
	/>
</template>