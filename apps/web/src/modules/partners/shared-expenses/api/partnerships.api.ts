import { partnershipResponseSchema } from '@expense-tracker/contracts'
import { apiRequest } from '@/shared/api/http'

export function fetchPartnership() {
  return apiRequest('/partnerships/me', partnershipResponseSchema)
}
