<script setup lang="ts">
import ExpensesByCategoryCard from '@/modules/personal/expenses/components/ExpensesByCategoryCard.vue'
import MonthlyBalanceCard from '@/modules/personal/expenses/components/MonthlyBalanceCard.vue'
import MonthSelector from '@/modules/personal/expenses/components/MonthSelector.vue'
import TransactionsTable from '@/modules/personal/expenses/components/TransactionsTable.vue'
import { useSelectedMonth } from '@/modules/personal/expenses/composables/useSelectedMonth'
import { useTransactions } from '@/modules/personal/expenses/composables/useTransactions'
import { Card } from '@/shared/ui/card'

const { month, range, canGoNext, previous, next } = useSelectedMonth()
const { rows, total, loading, isError, pagination } = useTransactions(range)
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Expenses</h1>
      <MonthSelector :month :can-go-next="canGoNext" @previous="previous" @next="next" />
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <MonthlyBalanceCard :month :range />
      <ExpensesByCategoryCard :range />
    </div>

    <Card class="@container gap-0 overflow-hidden rounded-lg py-0 shadow-none">
      <TransactionsTable v-model:pagination="pagination" :rows :total :loading :failed="isError" />
    </Card>
  </section>
</template>
