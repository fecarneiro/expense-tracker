<script setup lang="ts" generic="TData">
import {
  type ColumnDef,
  FlexRender,
  getCoreRowModel,
  type PaginationState,
  useVueTable,
} from '@tanstack/vue-table'
import { nextTick, useTemplateRef, watch } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import DataTablePagination from './DataTablePagination.vue'

const props = defineProps<{
  columns: ColumnDef<TData, any>[]
  data: TData[]
  rowCount: number
}>()

const pagination = defineModel<PaginationState>('pagination', { required: true })

const root = useTemplateRef('root')

// Matches scroll-mt-16, which keeps the rows clear of the sticky mobile header.
const SCROLL_MARGIN_PX = 64

watch(
  () => pagination.value.pageIndex,
  async () => {
    await nextTick()
    if ((root.value?.getBoundingClientRect().top ?? 0) < SCROLL_MARGIN_PX) {
      root.value?.scrollIntoView({ block: 'start' })
    }
  },
)

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  get rowCount() {
    return props.rowCount
  },
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  state: {
    get pagination() {
      return pagination.value
    },
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
})
</script>

<template>
  <div ref="root" class="scroll-mt-16">
    <Table class="table-fixed">
      <TableHeader class="bg-muted">
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="text-muted-foreground px-4"
            :class="header.column.columnDef.meta?.class"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="px-4 py-3"
            :class="cell.column.columnDef.meta?.class"
          >
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <DataTablePagination :table="table" />
  </div>
</template>
