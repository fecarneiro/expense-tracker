<script setup lang="ts">
import type {
  SharedExpenseReportItem,
  SharedExpenseReportResponse,
} from '@expense-tracker/contracts'
import { createColumnHelper, FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '@/api/http'
import { getAuthUser } from '@/auth/auth.session'
import { formatDate } from '@/utils/format-date'
import { formatMoney } from '@/utils/format-money'
import { formatParticipant } from '@/utils/format-partner'
import { formatText } from '@/utils/format-text'

const emptyRows: SharedExpenseReportItem[] = []

const data = ref<SharedExpenseReportResponse | null>(null)

const user = getAuthUser()
const currentUserId = user?.id ?? ''

const partnerUserId = ref('')
const partnershipLoaded = ref(false)

const loading = ref(true)
const errorMessage = ref<string | null>(null)

const status = ref('')
const payerUserId = ref('')
const owedUserId = ref('')

const pageSize = 20
const page = ref(0)
const offset = computed(() => page.value * pageSize)
const meta = computed(() => data.value?.meta)
const totalPages = computed(() =>
  meta.value ? Math.max(1, Math.ceil(meta.value.total / meta.value.limit)) : 1,
)
const canPrev = computed(() => page.value > 0)
const canNext = computed(() =>
  meta.value ? offset.value + meta.value.limit < meta.value.total : false,
)

const rows = computed(() => data.value?.data ?? emptyRows)
const hasPartner = computed(() => partnerUserId.value !== '')
const isEmpty = computed(() => !loading.value && rows.value.length === 0)
const showPagination = computed(
  () => !loading.value && !errorMessage.value && (meta.value?.total ?? 0) > 0,
)

async function loadReport() {
  loading.value = true
  errorMessage.value = null
  try {
    const query = new URLSearchParams()
    query.set('limit', String(pageSize))
    query.set('offset', String(offset.value))
    if (status.value) query.set('status', status.value)
    if (payerUserId.value) query.set('payerUserId', payerUserId.value)
    if (owedUserId.value) query.set('owedUserId', owedUserId.value)
    data.value = await apiRequest<SharedExpenseReportResponse>(
      `/shared-expenses?${query.toString()}`,
    )
  } catch {
    errorMessage.value = 'Unable to load shared expenses.'
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  page.value = 0
  void loadReport()
}

function goPrev() {
  if (!canPrev.value) return
  page.value -= 1
  void loadReport()
}

function goNext() {
  if (!canNext.value) return
  page.value += 1
  void loadReport()
}

async function loadPartnership() {
  try {
    const partnership = await apiRequest<{ partnerId: string } | null>('/partnerships/me')
    partnerUserId.value = partnership?.partnerId ?? ''
  } catch {
    partnerUserId.value = ''
  } finally {
    partnershipLoaded.value = true
  }
}

onMounted(() => {
  void loadPartnership()
  void loadReport()
})

const columnHelper = createColumnHelper<SharedExpenseReportItem>()

const columns = [
  columnHelper.accessor('occurredAt', {
    header: 'Date',
    cell: (info) => formatDate(info.getValue(), user?.locale ?? 'en-US', user?.timezone ?? 'UTC'),
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (info) => formatText(info.getValue()),
  }),
  columnHelper.accessor('categoryName', {
    header: 'Category',
    cell: (info) => formatText(info.getValue()),
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
    cell: (info) => formatText(info.getValue()),
  }),
]

const table = useVueTable({
  get data() {
    return rows.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <main class="shared-expenses-page">
    <div class="filters">
      <label>
        Status
        <select v-model="status" @change="onFilterChange">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="settled">Settled</option>
        </select>
      </label>

      <label>
        Payer
        <select v-model="payerUserId" @change="onFilterChange">
          <option value="">All</option>
          <option :value="currentUserId">You</option>
          <option v-if="hasPartner" :value="partnerUserId">Partner</option>
        </select>
      </label>

      <label>
        Owed By
        <select v-model="owedUserId" @change="onFilterChange">
          <option value="">All</option>
          <option :value="currentUserId">You</option>
          <option v-if="hasPartner" :value="partnerUserId">Partner</option>
        </select>
      </label>
    </div>

    <p v-if="partnershipLoaded && !hasPartner">No active partnership.</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="loading">Loading...</p>
    <p v-else-if="isEmpty">No shared expenses found.</p>

    <template v-else>
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

      <div v-if="showPagination" class="pagination">
        <button type="button" :disabled="!canPrev" @click="goPrev">←</button>
        <span>{{ page + 1 }} / {{ totalPages }}</span>
        <button type="button" :disabled="!canNext" @click="goNext">→</button>
      </div>
    </template>
  </main>
</template>
