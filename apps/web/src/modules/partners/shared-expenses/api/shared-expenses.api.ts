import {
  type CreateSharedExpenseRequest,
  type SharedExpenseStatus,
  sharedExpenseReportResponseSchema,
} from '@expense-tracker/contracts'
import { apiCommand, apiRequest } from '@/shared/api/http'

export type SharedExpensesFilters = {
  status: SharedExpenseStatus | ''
  payerUserId: string
}

export type ReportFilters = SharedExpensesFilters & {
  limit: number
  offset: number
}

export function fetchReport(filters: ReportFilters) {
  const query = new URLSearchParams()

  query.set('limit', String(filters.limit))
  query.set('offset', String(filters.offset))

  if (filters.status) query.set('status', filters.status)
  if (filters.payerUserId) query.set('payerUserId', filters.payerUserId)

  return apiRequest(`/shared-expenses?${query.toString()}`, sharedExpenseReportResponseSchema)
}

export function createSharedExpenses(expenses: CreateSharedExpenseRequest[]) {
  return apiCommand('/shared-expenses/batch', {
    method: 'POST',
    body: JSON.stringify({ expenses }),
  })
}
