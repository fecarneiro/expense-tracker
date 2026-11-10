<script setup lang="ts">
import type { TransactionResponse } from '@expense-tracker/contracts'
import type { PaginationState } from '@tanstack/vue-table'
import { createTransactionsColumns } from '@/modules/personal/expenses/components/transactions.columns'
import { useUserFormat } from '@/shared/composables/useUserFormat'
import { DataTable } from '@/shared/ui/data-table'

defineProps<{
  rows: TransactionResponse[]
  total: number
  loading: boolean
  failed: boolean
}>()

const pagination = defineModel<PaginationState>('pagination', { required: true })

const columns = createTransactionsColumns(useUserFormat())
</script>

<template>
  <p v-if="failed" class="text-muted-foreground px-4 py-8 text-center">
    Unable to load transactions.
  </p>
  <p v-else-if="loading" class="text-muted-foreground px-4 py-8 text-center">Loading...</p>
  <p v-else-if="rows.length === 0" class="text-muted-foreground px-4 py-8 text-center">
    No transactions found.
  </p>
  <DataTable
    v-else
    v-model:pagination="pagination"
    :columns="columns"
    :data="rows"
    :row-count="total"
  />
</template>
