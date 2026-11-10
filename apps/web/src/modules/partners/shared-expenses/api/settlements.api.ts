import { pendingBalanceSchema } from '@expense-tracker/contracts'
import { apiCommand, apiRequest } from '@/shared/api/http'

export function fetchBalance() {
  return apiRequest('/settlements/balance', pendingBalanceSchema)
}

export function settle() {
  return apiCommand('/settlements', { method: 'POST' })
}
