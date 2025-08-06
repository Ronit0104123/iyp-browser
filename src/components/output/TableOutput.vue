<script setup>
import { ref } from 'vue'
import { exportFile, useQuasar } from 'quasar'

const props = defineProps(['rows', 'columns'])

const filter = ref('')
const $q = useQuasar()

const wrapCsvValue = (val, formatFn, row) => {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val
  formatted = formatted === void 0 || formatted === null ? '' : String(formatted)
  formatted = formatted.split(`"`).join(`""`)
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split("\n").join("\\n")
  // .split("\r").join("\\r")
  return `"${formatted}"`
}

const exportTable = () => {
  const content = [props.columns.map((col) => wrapCsvValue(col.label))]
    .concat(
      props.rows.map((row) =>
        props.columns
          .map((col) =>
            wrapCsvValue(
              typeof col.field === 'function'
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field],
              col.format,
              row
            )
          )
          .join(',')
      )
    )
    .join('\r\n')
  const status = exportFile('table-export.csv', content, 'text/csv')
  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning',
      position: 'top-right'
    })
  }
}
</script>

<template>
  <div class="row justify-end q-mb-sm">
    <div class="col-3 q-mr-md">
      <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <div class="col-auto">
      <q-btn no-caps label="Export to CSV" icon-right="archive" outline @click="exportTable" />
    </div>
  </div>
  <q-table flat :rows="rows" :columns="columns" :filter="filter" row-key="index" />
</template>
