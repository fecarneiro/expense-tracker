<script setup lang="ts">
import type {
  SharedExpenseReportItem,
  SharedExpenseReportResponse,
} from '@expense-tracker/contracts'
import { createColumnHelper, FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '@/api/http'
import { getAuthUser } from '@/auth/auth.session'
import SharedExpenseCreateModal from '@/components/shared-expenses/SharedExpenseCreateModal.vue'
import SharedExpensesBalance from '@/components/shared-expenses/SharedExpensesBalance.vue'
import { formatDate } from '@/utils/format-date'
import { formatMoney } from '@/utils/format-money'
import { formatParticipant } from '@/utils/format-partner'
import { formatText } from '@/utils/format-text'

const emptyRows: SharedExpenseReportItem[] = []

type SharedExpenseCreateModalInstance = {
  open: () => void
}

type SharedExpensesBalanceInstance = {
  reload: () => Promise<void>
}

function isEmptyText(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0
}

const data = ref<SharedExpenseReportResponse | null>(null)
const createModal = ref<SharedExpenseCreateModalInstance | null>(null)
const balance = ref<SharedExpensesBalanceInstance | null>(null)

const user = getAuthUser()
const currentUserId = user?.id ?? ''

const partnerUserId = ref('')
const partnershipLoaded = ref(false)

const loading = ref(true)
const errorMessage = ref<string | null>(null)

const status = ref('pending')
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

function openCreateModal() {
  createModal.value?.open()
}

async function onExpensesCreated() {
  page.value = 0
  await Promise.all([loadReport(), balance.value?.reload()])
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
    cell: (info) => formatDate(info.getValue(), user?.locale, user?.timezone),
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
    cell: (info) => formatMoney(info.getValue(), user?.currency, user?.locale),
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
    cell: (info) => formatMoney(info.getValue(), user?.currency, user?.locale),
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
  <div class="shared-expenses-page">
    <SharedExpensesBalance ref="balance" v-if="hasPartner" @settled="loadReport" />

    <div class="table-card">
      <div class="table-toolbar">
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

        <button
          class="create-button"
          type="button"
          :disabled="!partnershipLoaded || !hasPartner"
          @click="openCreateModal"
        >
          <span aria-hidden="true">+</span>
          Add expense
        </button>
      </div>

      <p v-if="partnershipLoaded && !hasPartner" class="table-state">No active partnership.</p>
      <p v-else-if="errorMessage" class="table-state">{{ errorMessage }}</p>
      <p v-else-if="loading" class="table-state">Loading...</p>
      <p v-else-if="isEmpty" class="table-state">No shared expenses found.</p>

      <template v-else>
        <div class="table-container">
          <table>
            <thead>
              <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <th
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :data-column="header.column.id"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in table.getRowModel().rows" :key="row.id">
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :data-column="cell.column.id"
                  :data-status="cell.column.id === 'status' ? cell.getValue() : undefined"
                  :class="{
                    'table-cell--empty':
                      cell.column.id === 'description' && isEmptyText(cell.getValue()),
                  }"
                >
                  <div class="table-cell-content">
                    <template
                      v-if="cell.column.id === 'description' && isEmptyText(cell.getValue())"
                    >
                      —
                    </template>
                    <FlexRender
                      v-else
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="showPagination" class="pagination">
          <span class="pagination-info">
            Page <strong>{{ page + 1 }}</strong> of {{ totalPages }}
          </span>
          <div class="pagination-actions">
            <button class="pagination-button" type="button" :disabled="!canPrev" @click="goPrev">
              ←
            </button>
            <button class="pagination-button" type="button" :disabled="!canNext" @click="goNext">
              →
            </button>
          </div>
        </div>
      </template>
    </div>

    <SharedExpenseCreateModal ref="createModal" @created="onExpensesCreated" />
  </div>
</template>
<style scoped>
.shared-expenses-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-6);
  min-height: 0;
}

.table-card {
  flex: 0 0 auto;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.table-toolbar {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);

  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.table-toolbar label {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.table-toolbar select {
  width: auto;
  min-width: 8rem;
  padding: var(--space-2) var(--space-3);

  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-weight: 400;
}

.table-toolbar select:focus {
  border-color: var(--color-primary);
}

.create-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-left: auto;
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.create-button span {
  font-size: 1.125rem;
  line-height: 1;
}

.table-state {
  display: grid;
  place-items: center;
  margin: 0;
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
  text-align: center;
}

.table-container {
  overflow: auto;
}

.table-container:focus-visible {
  outline-offset: -0.1875rem;
}

table {
  width: 100%;
  min-width: 56rem;
  border-collapse: collapse;
}

th,
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}

th {
  position: sticky;
  z-index: 1;
  top: 0;
  background: var(--color-background);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: var(--color-background);
}

[data-column="description"] {
  width: 1%;
  min-width: 14rem;
}

td[data-column="description"] .table-cell-content {
  max-width: 28rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

td[data-column="description"].table-cell--empty {
  color: var(--color-text-muted);
}

td[data-column="occurredAt"] {
  color: var(--color-text-muted);
}

th[data-column="occurredAt"],
td[data-column="occurredAt"],
th[data-column="payerUserId"],
td[data-column="payerUserId"],
th[data-column="owedUserId"],
td[data-column="owedUserId"],
th[data-column="status"],
td[data-column="status"] {
  text-align: center;
}

td[data-column="occurredAt"],
td[data-column="totalAmountCents"],
td[data-column="owedAmountCents"] {
  font-variant-numeric: tabular-nums;
}

th[data-column="totalAmountCents"],
td[data-column="totalAmountCents"],
th[data-column="owedAmountCents"],
td[data-column="owedAmountCents"] {
  text-align: center;
}

td[data-column="status"] .table-cell-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4.5rem;
  padding: var(--space-1) var(--space-2);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25;
}

td[data-status="pending"] .table-cell-content {
  background: var(--color-warning-surface);
  color: var(--color-warning-text);
}

td[data-status="settled"] .table-cell-content {
  background: var(--color-success-surface);
  color: var(--color-success-text);
}

.pagination {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  min-height: 3rem;
  padding: var(--space-2) var(--space-4);
  border-top: 1px solid var(--color-border);
}

.pagination-info {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.pagination-actions {
  display: flex;
  gap: var(--space-1);
}

.pagination-button {
  display: grid;
  width: 2rem;
  height: 2rem;
  padding: 0;
  place-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
}

.pagination-button:hover:not(:disabled) {
  background: var(--color-background);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-button:disabled {
  background: var(--color-background);
  color: var(--color-text-muted);
}

@media (max-width: 48rem) {
  .table-toolbar label {
    flex: 1 1 12rem;
  }

  .table-toolbar select {
    flex: 1;
    min-width: 0;
  }

  .create-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
