<script setup>
import { computed } from "vue"
const props = defineProps(["rows", "columns"]);

const formattedColumns = computed(() => {
  if (!props.rows || props.rows.length === 0) return [];
  const allKeys = new Set();
  props.rows.slice(0, 5).forEach((row) => {
    Object.keys(row).forEach((key) => allKeys.add(key));
  });

  return [
    ...Array.from(allKeys).map((key) => ({
      name: key,
      label: key.replace(/_/g, " "),
      field: key,
      align: "left",
    }))
  ];
});


const formattedRows = computed(() => {
  if (!props.rows) return [];

  return props.rows.map((row, index) => {
    let formattedRow = { index: index + 1 };

    Object.keys(row).forEach((key) => {
      try {
        formattedRow[key] =
        (
          JSON.parse(row[key]).name ??
          JSON.parse(row[key]).prefix ??
          JSON.parse(row[key]).asn ??
          JSON.parse(row[key]).ip ??
          JSON.parse(row[key]).rank ??
          JSON.parse(row[key]).reference_org ??
          row[key]
        )
      } catch (error) {
        formattedRow[key] = row[key];
      }
    });

    return formattedRow;
  });
});

console.log("FROWS", formattedRows)
console.log("FCOLS", formattedColumns)
</script>

<template>
   <q-table flat :rows="formattedRows" :columns="formattedColumns" row-key="index" />
</template> 


