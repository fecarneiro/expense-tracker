<script setup lang="ts">
import type { SharedExpenseReportItem } from '@expense-tracker/contracts'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Toolbar from 'primevue/toolbar'
import { computed, ref } from 'vue'
import { getAuthUser } from '@/modules/auth/auth.session'
import {
  usePartnershipQuery,
  useSharedExpensesQuery,
} from '@/modules/shared-expenses/api/shared-expenses.queries'
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

const statusFilterOptions: SelectOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Settled', value: 'settled' },
]

const pageSize = 20

const user = getAuthUser()
const currentUserId = user?.id ?? ''

const createModal = ref<SharedExpenseCreateModalInstance | null>(null)

const status = ref('pending')
const owedUserId = ref('')
const first = ref(0)

const listParams = computed(() => ({
  limit: pageSize,
  offset: first.value,
  status: status.value || undefined,
  owedUserId: owedUserId.value || undefined,
}))

const expensesQuery = useSharedExpensesQuery(listParams)
const partnershipQuery = usePartnershipQuery()

const rows = computed<SharedExpenseReportItem[]>(() => expensesQuery.data.value?.data ?? [])
const meta = computed(() => expensesQuery.data.value?.meta)
const loading = computed(() => expensesQuery.isPending.value)
const errorMessage = computed(() =>
  expensesQuery.isError.value ? 'Unable to load shared expenses.' : null,
)

const partnerUserId = computed(() => partnershipQuery.data.value?.partnerId ?? '')
const partnershipLoaded = computed(() => !partnershipQuery.isPending.value)
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

function onFilterChange() {
  first.value = 0
}

function onPage(event: DataTablePageEvent) {
  first.value = event.first
}

function openCreateModal() {
  createModal.value?.open()
}
</script>

<template>
  <div class="shared-expenses-page">
    <SharedExpensesBalance v-if="hasPartner" />

    <Card>
      <template #title>Shared expenses</template>

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
            <template #empty>No shared expenses found.</template>

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
                {{ formatMoney(expense.owedAmountCents, user?.currency, user?.locale) }}
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
    </Card>

    <SharedExpenseCreateModal ref="createModal" @created="first = 0" />
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
  gap: var(--space-4);
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
