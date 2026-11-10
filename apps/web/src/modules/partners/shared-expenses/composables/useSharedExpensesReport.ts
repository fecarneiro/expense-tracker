import type { PaginationState } from '@tanstack/vue-table'
import { computed, type Ref, ref } from 'vue'
import type { SharedExpensesFilters } from '@/modules/partners/shared-expenses/api/shared-expenses.api'
import { useSharedReportQuery } from '@/modules/partners/shared-expenses/queries/shared-expenses.queries'
import { DEFAULT_PAGE_SIZE } from '@/shared/ui/data-table'

export function useSharedExpensesReport(enabled: Ref<boolean>) {
  const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE })
  const activeFilters = ref<SharedExpensesFilters>({
    status: 'pending',
    payerUserId: '',
  })

  function resetPage() {
    pagination.value = { ...pagination.value, pageIndex: 0 }
  }

  const filters = computed({
    get: () => activeFilters.value,
    set: (value) => {
      activeFilters.value = value
      resetPage()
    },
  })

  const reportFilters = computed(() => ({
    ...activeFilters.value,
    limit: pagination.value.pageSize,
    offset: pagination.value.pageIndex * pagination.value.pageSize,
  }))

  const { data: report, isPending: loading, isError } = useSharedReportQuery(reportFilters, enabled)

  const rows = computed(() => report.value?.data ?? [])
  const total = computed(() => report.value?.meta.total ?? 0)

  return { rows, total, loading, isError, filters, pagination, resetPage }
}
