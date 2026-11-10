<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { useUserFormat } from '@/shared/composables/useUserFormat'
import { Button } from '@/shared/ui/button'

defineProps<{
  month: string
  canGoNext: boolean
}>()

const emit = defineEmits<{
  previous: []
  next: []
}>()

const { monthYear } = useUserFormat()
</script>

<template>
  <div class="flex items-center gap-1">
    <Button variant="outline" size="icon-sm" aria-label="Previous month" @click="emit('previous')">
      <ChevronLeft />
    </Button>
    <span class="min-w-36 text-center text-sm font-medium" aria-live="polite">
      {{ monthYear(month) }}
    </span>
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Next month"
      :disabled="!canGoNext"
      @click="emit('next')"
    >
      <ChevronRight />
    </Button>
  </div>
</template>
