import type {
  CreateSharedExpenseRequest,
  PendingBalance,
  SharedExpenseReportResponse,
} from '@expense-tracker/contracts'
import { apiRequest } from '@/api/http'

export type ListSharedExpensesParams = {
  limit: number
  offset: number
  status?: string
  owedUserId?: string
}

export type SharedCategory = {
  id: string
  name: string
}

export type Partnership = {
  partnerId: string
}

export function listSharedExpenses(
  params: ListSharedExpensesParams,
): Promise<SharedExpenseReportResponse> {
  const query = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  })

  if (params.status) {
    query.set('status', params.status)
  }

  if (params.owedUserId) {
    query.set('owedUserId', params.owedUserId)
  }

  return apiRequest(`/shared-expenses?${query.toString()}`)
}

export function getCurrentPartnership(): Promise<Partnership | null> {
  return apiRequest('/partnerships/me')
}

export function listSharedCategories(): Promise<SharedCategory[]> {
  return apiRequest('/shared-categories')
}

export function createSharedExpense(expense: CreateSharedExpenseRequest): Promise<void> {
  return apiRequest('/shared-expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  })
}

export function getPendingBalance(): Promise<PendingBalance> {
  return apiRequest('/settlements/balance')
}

export function settlePendingBalance(): Promise<void> {
  return apiRequest('/settlements', {
    method: 'POST',
  })
}
