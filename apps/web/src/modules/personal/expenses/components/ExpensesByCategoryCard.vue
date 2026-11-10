<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useExpenseCategoryTotalsQuery } from '@/modules/personal/expenses/queries/transactions.queries'
import {
  categoryShareLabel,
  summarizeCategoryTotals,
} from '@/modules/personal/expenses/rules/category-totals.rules'
import type { TransactionRangeFilter } from '@/modules/personal/expenses/rules/month.rules'
import { useUserFormat } from '@/shared/composables/useUserFormat'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

const props = defineProps<{
  range: TransactionRangeFilter
}>()

const { money } = useUserFormat()

const expanded = ref(false)

const { data, isPending: loading, isError } = useExpenseCategoryTotalsQuery(toRef(props, 'range'))

const summary = computed(() => summarizeCategoryTotals(data.value ?? [], expanded.value))

function share(cents: number) {
  return categoryShareLabel(cents, summary.value.totalCents)
}
</script>

<template>
  <Card class="gap-0 rounded-lg p-4 shadow-none md:px-6 md:py-5">
    <h2 class="text-lg font-semibold">Expenses by category</h2>

    <p v-if="loading" class="text-muted-foreground mt-3">Loading categories...</p>
    <p v-else-if="isError" class="text-destructive mt-3" role="alert">Unable to load categories.</p>
    <p v-else-if="summary.rows.length === 0" class="text-muted-foreground mt-3">
      No expenses this month.
    </p>

    <template v-else>
      <ul
        class="mt-3 grid grid-cols-[6.5rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1.5 text-[0.8125rem] tabular-nums"
      >
        <li
          v-for="row in summary.rows"
          :key="row.categoryId"
          class="contents"
          :title="`${row.categoryName}: ${money(row.totalCents)}, ${share(row.totalCents)}`"
        >
          <span class="text-muted-foreground truncate">{{ row.categoryName }}</span>
          <span class="block py-1" aria-hidden="true">
            <span
              class="bg-category-bar block h-2.5 min-w-1 rounded-r-sm"
              :style="{ width: `${(row.totalCents / summary.largestCents) * 100}%` }"
            />
          </span>
          <span class="text-right font-medium">{{ money(row.totalCents) }}</span>
          <span class="text-muted-foreground min-w-9 text-right">{{ share(row.totalCents) }}</span>
        </li>
      </ul>

      <Button
        v-if="summary.hiddenCount > 0"
        class="text-muted-foreground hover:text-foreground mt-2 h-auto self-start p-0 text-[0.8125rem] font-normal tabular-nums underline"
        variant="link"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{
          expanded
            ? 'Show less'
            : `Show ${summary.hiddenCount} more (${money(summary.hiddenCents)}, ${share(summary.hiddenCents)})`
        }}
      </Button>
    </template>
  </Card>
</template>
