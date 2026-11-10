import { sharedCategoriesResponseSchema } from '@expense-tracker/contracts'
import { apiRequest } from '@/shared/api/http'

export function fetchSharedCategories() {
  return apiRequest('/shared-categories', sharedCategoriesResponseSchema)
}
