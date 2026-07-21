<script setup lang="ts">
import type {
  SharedExpenseReportItem,
  SharedExpenseReportResponse,
} from '@expense-tracker/contracts'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Toolbar from 'primevue/toolbar'
import { computed, onMounted, ref } from 'vue'
import {
  getCurrentPartnership,
  listSharedExpenses,
} from '@/modules/shared-expenses/api/shared-expenses.api'
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

type SharedExpenseCreateModalInstance = {
  open: () => void
}

type SharedExpensesBalanceInstance = {
  reload: () => Promise<void>
}

const statusFilterOptions: SelectOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Settled', value: 'settled' },
]

const pageSize = 20

const user = getAuthUser()
const currentUserId = user?.id ?? ''

const data = ref<SharedExpenseReportResponse | null>(null)
const createModal = ref<SharedExpenseCreateModalInstance | null>(null)
const balance = ref<SharedExpensesBalanceInstance | null>(null)

const partnerUserId = ref('')
const partnershipLoaded = ref(false)

const loading = ref(true)
const errorMessage = ref<string | null>(null)

const status = ref('pending')
const owedUserId = ref('')
const first = ref(0)

const rows = computed<SharedExpenseReportItem[]>(() => data.value?.data ?? [])

const meta = computed(() => data.value?.meta)

const hasPartner = computed(() => partnerUserId.value !== '')

const owedByFilterOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [
    { label: 'All', value: '' },
    { label: 'You', value: currentUserId },
  ]

  if (partnerUserId.value) {
    options.push({
      label: 'Partner',
      value: partnerUserId.value,
    })
  }

  return options
})

async function loadReport() {
  loading.value = true
  errorMessage.value = null

  try {
    data.value = await listSharedExpenses({
      limit: pageSize,
      offset: first.value,
      status: status.value || undefined,
      owedUserId: owedUserId.value || undefined,
    })
  } catch {
    data.value = null
    errorMessage.value = 'Unable to load shared expenses.'
  } finally {
    loading.value = false
  }
}

async function loadPartnership() {
  partnershipLoaded.value = false

  try {
    const partnership = await getCurrentPartnership()

    partnerUserId.value = partnership?.partnerId ?? ''
  } catch {
    partnerUserId.value = ''
  } finally {
    partnershipLoaded.value = true
  }
}

function onFilterChange() {
  first.value = 0
  void loadReport()
}

function onPage(event: DataTablePageEvent) {
  first.value = event.first
  void loadReport()
}

function openCreateModal() {
  createModal.value?.open()
}

async function onExpensesCreated() {
  first.value = 0

  await Promise.all([loadReport(), balance.value?.reload()])
}

onMounted(() => {
  void loadPartnership()
  void loadReport()
})
</script>

<template>
  <div class="shared-expenses-page">
    <SharedExpensesBalance v-if="hasPartner" ref="balance" @settled="loadReport" />

    <Card>
      <template #title> Shared expenses </template>

      <template #content>
        <div class="card-content">
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
                  placeholder="Owed by"
                  @change="onFilterChange"
                />
              </div>
            </template>

            <template #end>
              <Button
                label="Add expense"
                icon="pi pi-plus"
                :disabled="!partnershipLoaded || !hasPartner"
                @click="openCreateModal"
              />
            </template>
          </Toolbar>

          <Message v-if="partnershipLoaded && !hasPartner" severity="info" :closable="false">
            No active partnership.
          </Message>

          <Message v-else-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <DataTable
            v-else
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
                {{ formatDate(
                    expense.occurredAt,
                    user?.locale,
                    user?.timezone,
                  ) }}
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
                {{ formatParticipant(
                    expense.owedUserId,
                    currentUserId,
                  ) }}
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
                  :severity="
                    expense.status === 'pending'
                      ? 'warn'
                      : 'success'
                  "
                />
              </template>
            </Column>
          </DataTable>
        </div>
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

.card-content {
  display: grid;
  gap: 1rem;
}

.expense-filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.expense-filter {
  min-width: 10rem;
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
