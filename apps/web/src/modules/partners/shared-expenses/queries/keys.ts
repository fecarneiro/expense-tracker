import type { QueryClient } from '@tanstack/vue-query'

export const sharedBalanceKey = ['shared-balance-key'] as const
export const sharedReportKey = ['shared-report-key'] as const
export const sharedCategoriesKey = ['shared-categories-key'] as const
export const partnershipKey = ['partnership-key'] as const

export function invalidateSharedExpenses(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: sharedBalanceKey }),
    queryClient.invalidateQueries({ queryKey: sharedReportKey }),
  ])
}
