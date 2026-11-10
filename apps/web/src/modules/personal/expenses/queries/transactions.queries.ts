import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import {
  fetchExpenseCategoryTotals,
  fetchMonthlyBalance,
  fetchTransactions,
  type TransactionsFilters,
} from '@/modules/personal/expenses/api/transactions.api'
import type { TransactionRangeFilter } from '@/modules/personal/expenses/rules/month.rules'

const transactionsKey = ['transactions-key'] as const
const monthlyBalanceKey = ['monthly-balance-key'] as const
const expenseCategoryTotalsKey = ['expense-category-totals-key'] as const

export function useTransactionsQuery(filters: Ref<TransactionsFilters>) {
  return useQuery({
    queryKey: [...transactionsKey, filters],
    queryFn: () => fetchTransactions(filters.value),
    placeholderData: keepPreviousData,
  })
}

export function useMonthlyBalanceQuery(range: Ref<TransactionRangeFilter>) {
  return useQuery({
    queryKey: [...monthlyBalanceKey, range],
    queryFn: () => fetchMonthlyBalance(range.value),
    placeholderData: keepPreviousData,
  })
}

export function useExpenseCategoryTotalsQuery(range: Ref<TransactionRangeFilter>) {
  return useQuery({
    queryKey: [...expenseCategoryTotalsKey, range],
    queryFn: () => fetchExpenseCategoryTotals(range.value),
    placeholderData: keepPreviousData,
  })
}
