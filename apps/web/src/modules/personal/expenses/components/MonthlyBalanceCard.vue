<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useMonthlyBalanceQuery } from '@/modules/personal/expenses/queries/transactions.queries'
import type { TransactionRangeFilter } from '@/modules/personal/expenses/rules/month.rules'
import { useUserFormat } from '@/shared/composables/useUserFormat'
import { Card } from '@/shared/ui/card'

const props = defineProps<{
  month: string
  range: TransactionRangeFilter
}>()

const { money } = useUserFormat()

const { data, isPending: loading, isError } = useMonthlyBalanceQuery(toRef(props, 'range'))

const row = computed(() => data.value?.find(({ month }) => month === props.month))
const balance = computed(() => row.value?.balance ?? 0)
const balanceLabel = computed(() =>
  balance.value < 0 ? `−${money(-balance.value)}` : money(balance.value),
)
</script>

<template>
  <Card class="gap-0 rounded-lg p-4 shadow-none md:px-6 md:py-5">
    <p v-if="loading" class="text-muted-foreground">Loading balance...</p>
    <p v-else-if="isError" class="text-destructive" role="alert">Unable to load balance.</p>

    <template v-else>
      <h2 class="text-lg font-semibold">Balance</h2>
      <p class="mt-1 mb-4 text-4xl font-semibold tracking-tight">{{ balanceLabel }}</p>

      <dl
        class="mt-auto grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t pt-3 text-sm tabular-nums"
      >
        <dt class="text-muted-foreground">Incomes</dt>
        <dd class="text-success-text text-right font-medium">
          +{{ money(row?.incomeTotal ?? 0) }}
        </dd>
        <dt class="text-muted-foreground">Expenses</dt>
        <dd class="text-right font-medium">−{{ money(row?.expenseTotal ?? 0) }}</dd>
      </dl>
    </template>
  </Card>
</template>
