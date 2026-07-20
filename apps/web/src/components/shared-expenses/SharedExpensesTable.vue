<script setup lang="ts">
import type {
  SharedExpenseReportItem,
  SharedExpenseReportResponse,
} from '@expense-tracker/contracts'
import { createColumnHelper, FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { onMounted, ref } from 'vue'
import { apiRequest } from '@/api/http'
import { getAuthUser } from '@/auth/auth.session'
import { formatDate } from '@/utils/format-date'
import { formatMoney } from '@/utils/format-money'
import { formatParticipant } from '@/utils/format-partner'
import { formatSentenceCase } from '@/utils/format-text'

const data = ref<SharedExpenseReportResponse | null>(null)

const user = getAuthUser()
const currentUserId = user?.id ?? ''

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
  columnHelper.accessor('occurredAt', {
    header: 'Date',
    cell: (info) => formatDate(info.getValue(), user?.locale ?? 'en-US', user?.timezone ?? 'UTC'),
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (info) => formatSentenceCase(info.getValue()),
  }),
  columnHelper.accessor('categoryName', {
    header: 'Category',
    cell: (info) => formatSentenceCase(info.getValue()),
  }),
  columnHelper.accessor('totalAmountCents', {
    header: 'Total',
    cell: (info) => formatMoney(info.getValue(), user?.currency ?? 'USD', user?.locale ?? 'en-US'),
  }),
  columnHelper.accessor('payerUserId', {
    header: 'Payer',
    cell: (info) => formatParticipant(info.getValue(), currentUserId),
  }),
  columnHelper.accessor('owedUserId', {
    header: 'Owed By',
    cell: (info) => formatParticipant(info.getValue(), currentUserId),
  }),
  columnHelper.accessor('owedAmountCents', {
    header: 'Pending',
    cell: (info) => formatMoney(info.getValue(), user?.currency ?? 'USD', user?.locale ?? 'en-US'),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => formatSentenceCase(info.getValue()),
  }),
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
