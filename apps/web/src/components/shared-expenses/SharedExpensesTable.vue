<script setup lang="ts">
import type {
  SharedExpenseReportItem,
  SharedExpenseReportResponse,
} from '@expense-tracker/contracts'
import { createColumnHelper, FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiRequest } from '@/api/http'

const router = useRouter()

const data = ref<SharedExpenseReportResponse | null>(null)

const loading = ref(true)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  errorMessage.value = null
  try {
    data.value = await apiRequest<SharedExpenseReportResponse>('/shared-expenses')
  } catch {
    errorMessage.value = 'Unable to load shared expenses.'
  } finally {
    loading.value = false
  }
})

const columnHelper = createColumnHelper<SharedExpenseReportItem>()

const columns = [
  columnHelper.accessor('occurredAt', { header: 'Date' }),
  columnHelper.accessor('categoryName', { header: 'Category' }),
  columnHelper.accessor('totalAmountCents', { header: 'Total' }),
  columnHelper.accessor('payerUserId', { header: 'Payer' }),
  columnHelper.accessor('owedUserId', { header: 'Owed By' }),
  columnHelper.accessor('owedAmountCents', { header: 'Pending' }),
  columnHelper.accessor('description', { header: 'Description' }),
  columnHelper.accessor('status', { header: 'Status' }),
]

const table = useVueTable({
  get data() {
    return data.value?.data ?? []
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <main class="login-page">
    <p v-if="errorMessage">
      {{ errorMessage }}
    </p>
    <table>
      <thead>
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </table>
    <!-- TODO: implement case for data.value = [] -->
  </main>
</template>
