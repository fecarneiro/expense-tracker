<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { useAppearance } from '@/shared/composables/useAppearance'

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'System' },
] as const

const { store: selected, state: resolved } = useAppearance()
</script>

<template>
  <div class="border-t pt-4">
    <p class="mb-2 flex items-center gap-2 px-2 text-sm">
      <Moon v-if="resolved === 'dark'" class="size-4" aria-hidden="true" />
      <Sun v-else class="size-4" aria-hidden="true" />
      Appearance
    </p>
    <fieldset class="grid grid-cols-3 rounded-lg border p-0.5" aria-label="Appearance">
      <button
        v-for="option in OPTIONS"
        :key="option.value"
        type="button"
        class="text-muted-foreground aria-pressed:bg-sidebar-accent aria-pressed:text-sidebar-accent-foreground rounded-md px-1 py-1 text-[0.8125rem] aria-pressed:font-semibold"
        :aria-pressed="selected === option.value"
        @click="selected = option.value"
      >
        {{ option.label }}
      </button>
    </fieldset>
  </div>
</template>
