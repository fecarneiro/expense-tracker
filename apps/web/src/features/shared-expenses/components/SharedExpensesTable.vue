<script setup lang="ts">
import type {
  SharedExpenseReportItem,
  SharedExpenseReportResponse,
} from '@expense-tracker/contracts'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Toolbar from 'primevue/toolbar'
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '@/api/http'
import { getAuthUser } from '@/shared/auth/auth.session'
import { formatDate } from '@/utils/format-date'
import { formatMoney } from '@/utils/format-money'
import { formatParticipant } from '@/utils/format-partner'
import SharedExpenseCreateModal from './SharedExpenseCreateModal.vue'
import SharedExpensesBalance from './SharedExpensesBalance.vue'

type SelectOption = {
  label: string
  value: string
}

const statusFilterOptions: SelectOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Settled', value: 'settled' },
]

const user = getAuthUser()
const currentUserId = user?.id ?? ''

const partnerUserId = ref('')
const partnershipLoaded = ref(false)

const owedByFilterOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [
    { label: 'All', value: '' },
    { label: 'You', value: currentUserId },
  ]
  if (partnerUserId.value) {
    options.push({ label: 'Partner', value: partnerUserId.value })
  }
  return options
})

const emptyRows: SharedExpenseReportItem[] = []

type SharedExpenseCreateModalInstance = {
  open: () => void
}

type SharedExpensesBalanceInstance = {
  reload: () => Promise<void>
}

const data = ref<SharedExpenseReportResponse | null>(null)
const createModal = ref<SharedExpenseCreateModalInstance | null>(null)
const balance = ref<SharedExpensesBalanceInstance | null>(null)

const loading = ref(true)
const errorMessage = ref<string | null>(null)

const status = ref('pending')
const owedUserId = ref('')

const page = ref(0)
const offset = computed(() => page.value * pageSize)

const rows = computed(() => data.value?.data ?? emptyRows)
const hasPartner = computed(() => partnerUserId.value !== '')

async function loadReport() {
  loading.value = true
  errorMessage.value = null
  try {
    const query = new URLSearchParams()
    query.set('limit', String(pageSize))
    query.set('offset', String(offset.value))
    if (status.value) query.set('status', status.value)
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

const pageSize = 20
const first = ref(0)

const meta = computed(() => data.value?.meta)

function onFilterChange() {
  page.value = 0
  first.value = 0
  void loadReport()
}

function onPage(event: { first: number; page: number }) {
  first.value = event.first
  page.value = event.page
  void loadReport()
}

function openCreateModal() {
  createModal.value?.open()
}

async function onExpensesCreated() {
  page.value = 0
  first.value = 0
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
</script>

<template>
  <div class="shared-expenses-page">
    <SharedExpensesBalance ref="balance" v-if="hasPartner" @settled="loadReport" />

    <Card>
      <template #title> Shared expenses </template>

      <template #content>
        <Toolbar>
          <template #start>
            <div class="expense-filter-wrapper">
              <Select
                v-model="status"
                :options="statusFilterOptions"
                class="expense-filter"
                option-label="label"
                option-value="value"
                placeholder="Status"
                @change="onFilterChange"
              />

              <Select
                v-model="owedUserId"
                :options="owedByFilterOptions"
                class="expense-filter"
                option-label="label"
                option-value="value"
                placeholder="Owed By"
                @change="onFilterChange"
              />
            </div>
          </template>

          <template #end>
            <Button
              label="Add expense"
              :disabled="!partnershipLoaded || !hasPartner"
              @click="openCreateModal"
            />
          </template>
        </Toolbar>

        <p v-if="partnershipLoaded && !hasPartner" class="table-state">No active partnership.</p>
        <p v-else-if="errorMessage" class="table-state">{{ errorMessage }}</p>

        <template v-else>
          <div class="table-container">
            <DataTable
              :value="rows"
              data-key="id"
              lazy
              paginator
              scrollable
              :first="first"
              :rows="pageSize"
              :total-records="meta?.total ?? 0"
              :loading="loading"
              :always-show-paginator="false"
              table-style="min-width: 64rem"
              @page="onPage"
            >
              <template #empty> No shared expenses found. </template>
              <Column field="occurredAt" header="Date">
                <template #body="{ data: expense }">
                  {{ formatDate(expense.occurredAt, user?.locale, user?.timezone) }}
                </template>
              </Column>
              <Column field="description" header="Description">
                <template #body="{ data: expense }">
                  {{ expense.description || '—' }}
                </template>
              </Column>

              <Column field="categoryName" header="Category" />

              <Column field="owedUserId" header="Owed by">
                <template #body="{ data: expense }">
                  {{ formatParticipant(expense.owedUserId, currentUserId) }}
                </template>
              </Column>

              <Column field="owedAmountCents" header="Pending">
                <template #body="{ data: expense }">
                  {{ formatMoney(
          expense.owedAmountCents,
          user?.currency,
          user?.locale,
        ) }}
                </template>
              </Column>

              <Column field="status" header="Status">
                <template #body="{ data: expense }">
                  <Tag
                    :value="expense.status"
                    :severity="expense.status === 'pending' ? 'warn' : 'success'"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </template>
    </Card>
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

.expense-filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.expense-filter {
  min-width: 10rem;
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

@media (max-width: 48rem) {
  .expense-filter-wrapper {
    width: 100%;
  }

  .expense-filter {
    flex: 1 1 100%;
  }
}
</style>
