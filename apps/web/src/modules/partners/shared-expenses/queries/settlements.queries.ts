import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchBalance, settle } from '@/modules/partners/shared-expenses/api/settlements.api'
import { invalidateSharedExpenses, sharedBalanceKey } from './keys'

export function useSharedBalanceQuery() {
  return useQuery({
    queryKey: sharedBalanceKey,
    queryFn: fetchBalance,
  })
}

export function useSettleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: settle,
    onSuccess: () => invalidateSharedExpenses(queryClient),
  })
}
