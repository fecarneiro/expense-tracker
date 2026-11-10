import type { PaginationState } from '@tanstack/vue-table'
import { computed, type Ref, ref, watch } from 'vue'
import { useTransactionsQuery } from '@/modules/personal/expenses/queries/transactions.queries'
import type { TransactionRangeFilter } from '@/modules/personal/expenses/rules/month.rules'
import { DEFAULT_PAGE_SIZE } from '@/shared/ui/data-table'

export function useTransactions(range: Ref<TransactionRangeFilter>) {
  const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE })

  watch(range, () => {
    pagination.value = { ...pagination.value, pageIndex: 0 }
  })

  const filters = computed(() => ({
    ...range.value,
    limit: pagination.value.pageSize,
    offset: pagination.value.pageIndex * pagination.value.pageSize,
  }))

  const { data, isPending: loading, isError } = useTransactionsQuery(filters)

  const rows = computed(() => data.value?.data ?? [])
  const total = computed(() => data.value?.meta.total ?? 0)

  return { rows, total, loading, isError, pagination }
}
