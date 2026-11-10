import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import {
  createSharedExpenses,
  fetchReport,
  type ReportFilters,
} from '@/modules/partners/shared-expenses/api/shared-expenses.api'
import { invalidateSharedExpenses, sharedReportKey } from './keys'

export function useSharedReportQuery(filters: Ref<ReportFilters>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: [...sharedReportKey, filters],
    queryFn: () => fetchReport(filters.value),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useCreateSharedExpensesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSharedExpenses,
    onSuccess: () => invalidateSharedExpenses(queryClient),
  })
}
