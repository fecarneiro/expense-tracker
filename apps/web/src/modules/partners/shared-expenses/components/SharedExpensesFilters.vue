<script setup lang="ts">
import { computed } from 'vue'
import type { SharedExpensesFilters } from '@/modules/partners/shared-expenses/api/shared-expenses.api'
import { getAuthUser } from '@/shared/auth/auth.session'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const { partnerUserId } = defineProps<{
  partnerUserId: string
}>()

const filters = defineModel<SharedExpensesFilters>({ required: true })

// The Select does not accept an empty value, so "All" maps to '' in the filters.
const ALL = 'all'

const user = getAuthUser()

const participants = computed(() => [
  { value: ALL, label: 'All' },
  { value: user?.id ?? '', label: 'You' },
  ...(partnerUserId ? [{ value: partnerUserId, label: 'Partner' }] : []),
])

const fields = computed(() => [
  {
    key: 'status' as const,
    label: 'Status',
    options: [
      { value: ALL, label: 'All' },
      { value: 'pending', label: 'Pending' },
      { value: 'settled', label: 'Settled' },
    ],
  },
  { key: 'payerUserId' as const, label: 'Paid by', options: participants.value },
])

function update(key: keyof SharedExpensesFilters, value: unknown) {
  filters.value = {
    ...filters.value,
    [key]: value === ALL ? '' : value,
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 border-b px-4 py-3">
    <div v-for="field in fields" :key="field.key" class="flex items-center gap-2 max-md:flex-1">
      <Label :for="`filter-${field.key}`" class="text-muted-foreground">{{ field.label }}</Label>
      <Select
        :model-value="filters[field.key] || ALL"
        @update:model-value="update(field.key, $event)"
      >
        <SelectTrigger :id="`filter-${field.key}`" class="min-w-32 max-md:flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in field.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
