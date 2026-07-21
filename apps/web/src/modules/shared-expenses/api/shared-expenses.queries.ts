import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import {
  createSharedExpense,
  getCurrentPartnership,
  type ListSharedExpensesParams,
  listSharedExpenses,
  settlePendingBalance,
} from './shared-expenses.api'

export function useSharedExpensesQuery(params: MaybeRefOrGetter<ListSharedExpensesParams>) {
  return useQuery({
    queryKey: ['shared-expenses', params],
    queryFn: () => listSharedExpenses(toValue(params)),
  })
}

export function usePartnershipQuery() {
  return useQuery({
    queryKey: ['partnership'],
    queryFn: getCurrentPartnership,
  })
}

export function useCreateSharedExpensesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSharedExpense,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shared-expenses'] })
      void queryClient.invalidateQueries({ queryKey: ['pending-balance'] })
    },
  })
}

export function useSettlePendingBalanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settlePendingBalance,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shared-expenses'] })
      void queryClient.invalidateQueries({ queryKey: ['pending-balance'] })
    },
  })
}
