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


// const formattedRows = computed(() => {
//   if (!props.rows) return [];

//   return props.rows.map((row, index) => {
//     let formattedRow = { index: index + 1 };

//     Object.keys(row).forEach((key) => {
//       // console.log(row[key])
//       try {
//         formattedRow[key] =
//         (
//           JSON.parse(row[key]).name ??
//           JSON.parse(row[key]).prefix ??
//           JSON.parse(row[key]).asn ??
//           JSON.parse(row[key]).ip ??
//           JSON.parse(row[key]).rank ??
//           JSON.parse(row[key]).reference_org ??
//           row[key]
//         )
//       } catch (error) {
//         formattedRow[key] = row[key];
//       }
//     });

//     return formattedRow;
//   });
// });

// console.log("FROWS", formattedRows)
// console.log("FCOLS", formattedColumns)

const formattedRows = computed(() => {
  if (!props.rows) return [];
  
  return props.rows.map((row, index) => {

    let formattedRow = { index: index + 1 };
    Object.keys(row).forEach((key) => {
      try {
        const parsed = typeof row[key] === 'string' ? JSON.parse(row[key]) : row[key];
        if (typeof parsed === 'object' && parsed !== null) {
          const keys = Object.keys(parsed);
          if (keys.length === 1) {
            formattedRow[key] = parsed[keys[0]];
          } else {
            formattedRow[key] = JSON.stringify(parsed, null, 2);
          }
        } else {
          formattedRow[key] = row[key];
        }
      } catch (error) {
        formattedRow[key] = row[key];
      }
    });

    return formattedRow;
  });
});


const isProbablyJSON = (val) => {
  if (typeof val !== 'string') return false;
  return val.trim().startsWith('{') || val.trim().startsWith('[');
};


const isLinkable = (val) => {
  const str = String(val);
  return (
    /^AS?\d+$/.test(str) || /^\d+$/.test(str)
  );
};


const goToIHR = (val) => {
  const stringVal = String(val);
  const asn = stringVal.replace(/^AS/, '');
  window.open(`https://www.ihr.live/en/network/AS${asn}`, '_blank');
};


</script>

<template>
<q-table
  flat
  :rows="formattedRows"
  :columns="formattedColumns"
  row-key="index"
>
  <template v-slot:body-cell="props">
    <q-td :props="props">
      <span
        v-if="props.col.name !== 'index' && isLinkable(props.value)"
        class="text-primary cursor-pointer"
        @click="goToIHR(props.value)"
      >
        {{ props.value }}
      </span>
      <pre
        v-else-if="isProbablyJSON(props.value)"
        class="bg-grey-2 q-pa-sm q-ma-none text-left"
        style="white-space: pre-wrap; word-break: break-word;"
      >
        {{ props.value }}
      </pre>
      <span v-else>
        {{ props.value }}
      </span>
    </q-td>
  </template>
</q-table>
</template> 


