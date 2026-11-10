import '@tanstack/vue-table'
import type { RowData } from '@tanstack/vue-table'

export { default as DataTable } from './DataTable.vue'

export const DEFAULT_PAGE_SIZE = 10

// Columns with this class move to a second line in the description on narrow containers.
export const WIDE_ONLY = '@max-3xl:hidden'

declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    class?: string
  }
}
