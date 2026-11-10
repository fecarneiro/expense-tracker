import {
  expenseCategoryTotalsResponseSchema,
  monthlyBalanceResponseSchema,
  transactionsResponseSchema,
} from '@expense-tracker/contracts'
import type { TransactionRangeFilter } from '@/modules/personal/expenses/rules/month.rules'
import { apiRequest } from '@/shared/api/http'

export type TransactionsFilters = TransactionRangeFilter & {
  limit: number
  offset: number
}

export function fetchTransactions({ limit, offset, from, until }: TransactionsFilters) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    from,
    until,
  })

  return apiRequest(`/transactions?${query.toString()}`, transactionsResponseSchema)
}

export function fetchMonthlyBalance({ from, until }: TransactionRangeFilter) {
  const query = new URLSearchParams({ from, until })

  return apiRequest(
    `/transactions/monthly-balance?${query.toString()}`,
    monthlyBalanceResponseSchema,
  )
}

export function fetchExpenseCategoryTotals({ from, until }: TransactionRangeFilter) {
  const query = new URLSearchParams({ from, until })

  return apiRequest(
    `/transactions/category-totals?${query.toString()}`,
    expenseCategoryTotalsResponseSchema,
  )
}
