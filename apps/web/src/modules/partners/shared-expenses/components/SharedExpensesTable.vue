<script setup lang="ts">
import type { SharedExpenseReportItem } from '@expense-tracker/contracts'
import type { PaginationState } from '@tanstack/vue-table'
import { computed } from 'vue'
import { createSharedExpensesColumns } from '@/modules/partners/shared-expenses/components/shared-expenses.columns'
import { getAuthUser } from '@/shared/auth/auth.session'
import { useUserFormat } from '@/shared/composables/useUserFormat'
import { DataTable } from '@/shared/ui/data-table'

const { showStatus } = defineProps<{
  rows: SharedExpenseReportItem[]
  total: number
  loading: boolean
  failed: boolean
  partnerUserId: string
  showStatus: boolean
}>()

const pagination = defineModel<PaginationState>('pagination', { required: true })

const userId = getAuthUser()?.id
const { money, date } = useUserFormat()
const columns = computed(() => createSharedExpensesColumns({ userId, money, date, showStatus }))
</script>

<template>
  <p v-if="!partnerUserId" class="text-muted-foreground px-4 py-8 text-center">
    No active partnership.
  </p>
  <p v-else-if="failed" class="text-muted-foreground px-4 py-8 text-center">
    Unable to load shared expenses.
  </p>
  <p v-else-if="loading" class="text-muted-foreground px-4 py-8 text-center">Loading...</p>
  <p v-else-if="rows.length === 0" class="text-muted-foreground px-4 py-8 text-center">
    No shared expenses found.
  </p>
  <DataTable
    v-else
    v-model:pagination="pagination"
    :columns="columns"
    :data="rows"
    :row-count="total"
  />
</template>
