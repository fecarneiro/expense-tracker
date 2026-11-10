<script setup lang="ts" generic="TData">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/shared/ui/button'

defineProps<{
  table: Table<TData>
}>()
</script>

<template>
  <div class="flex min-h-12 items-center justify-end gap-3 border-t px-4 py-2">
    <span class="text-muted-foreground text-sm tabular-nums">
      Page
      <strong>{{ table.getState().pagination.pageIndex + 1 }}</strong>
      of {{ Math.max(table.getPageCount(), 1) }}
    </span>
    <div class="flex gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Previous page"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next page"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        <ChevronRight />
      </Button>
    </div>
  </div>
</template>
