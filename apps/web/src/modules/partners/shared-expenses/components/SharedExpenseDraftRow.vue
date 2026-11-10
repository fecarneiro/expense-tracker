<script setup lang="ts">
import {
  type SharedCategory,
  SPLIT_TYPE,
  type SplitType,
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
} from '@expense-tracker/contracts'
import { X } from '@lucide/vue'
import {
  type DraftField,
  findCategoryByPrefix,
  type SharedExpenseDraft,
  updateDraftField,
} from '@/modules/partners/shared-expenses/rules/shared-expense.rules'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const props = defineProps<{
  categories: SharedCategory[]
  amountPlaceholder: string
  disabled: boolean
  removable: boolean
}>()

const emit = defineEmits<{
  next: []
  remove: []
}>()

const draft = defineModel<SharedExpenseDraft>({ required: true })

const SPLIT_OPTIONS: { value: SplitType; label: string; title: string }[] = [
  { value: SPLIT_TYPE.FULL, label: 'Full', title: 'Partner owes the full amount' },
  { value: SPLIT_TYPE.HALF, label: 'Half', title: 'You split it equally' },
]

const CATEGORY_SEARCH_RESET_MS = 700

// Keeps the error color while the field has focus.
const INVALID_FOCUS =
  'aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/40'
const ERROR_CLASS = 'text-destructive mt-1 text-[0.8125rem] leading-tight'

let categorySearch = ''
let categorySearchTimer: ReturnType<typeof setTimeout> | undefined

function errorId(field: DraftField) {
  return `draft-error-${draft.value.clientId}-${field}`
}

function invalidProps(field: DraftField) {
  return draft.value.errors[field]
    ? { 'aria-invalid': true, 'aria-describedby': errorId(field) }
    : {}
}

function update(field: DraftField, value: unknown) {
  draft.value = updateDraftField(draft.value, field, String(value))
}

// The Select only changes its value with the list open, so typing a name with it
// closed is handled here to keep the batch fast with the keyboard.
function selectCategoryByTyping(event: KeyboardEvent) {
  const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey
  if (!isPrintable || (event.key === ' ' && !categorySearch)) return

  clearTimeout(categorySearchTimer)
  categorySearch += event.key
  categorySearchTimer = setTimeout(() => {
    categorySearch = ''
  }, CATEGORY_SEARCH_RESET_MS)

  const category = findCategoryByPrefix(props.categories, categorySearch)
  if (category) update('sharedCategoryId', category.id)
}
</script>

<template>
  <div class="border-b py-3 md:border-b-0 md:py-1">
    <div
      class="grid grid-cols-[6.5rem_minmax(0,1fr)_2rem] items-center gap-x-2 md:grid-cols-[7rem_minmax(9rem,1fr)_8rem_minmax(10rem,1.4fr)_2rem]"
    >
      <Input
        :model-value="draft.amount"
        :data-amount="draft.clientId"
        :class="['col-start-1 row-start-1 tabular-nums', INVALID_FOCUS]"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        aria-label="Amount"
        :placeholder="amountPlaceholder"
        :disabled="disabled"
        v-bind="invalidProps('amount')"
        @update:model-value="update('amount', $event)"
        @keydown.enter.prevent="emit('next')"
      />

      <Select
        :model-value="draft.sharedCategoryId"
        :disabled="disabled"
        @update:model-value="update('sharedCategoryId', $event)"
      >
        <SelectTrigger
          :class="['col-start-2 row-start-1 w-full', INVALID_FOCUS]"
          aria-label="Category"
          v-bind="invalidProps('sharedCategoryId')"
          @keydown="selectCategoryByTyping"
        >
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <fieldset
        class="col-start-1 row-start-3 mt-2 grid h-9 grid-cols-2 rounded-md border p-0.5 md:col-start-3 md:row-start-1 md:mt-0"
        aria-label="Split"
        :disabled="disabled"
      >
        <label
          v-for="option in SPLIT_OPTIONS"
          :key="option.value"
          :title="option.title"
          class="text-muted-foreground has-checked:bg-secondary has-checked:text-foreground has-focus-visible:outline-ring grid cursor-pointer place-items-center rounded-sm text-[0.8125rem] outline-offset-1 has-checked:font-semibold has-focus-visible:outline-2"
        >
          <input
            :checked="draft.split === option.value"
            class="sr-only"
            type="radio"
            :name="`split-${draft.clientId}`"
            :value="option.value"
            @change="draft = { ...draft, split: option.value }"
            @keydown.enter.prevent="emit('next')"
          >
          {{ option.label }}
        </label>
      </fieldset>

      <Input
        :model-value="draft.description"
        :class="[
          'col-span-2 col-start-2 row-start-3 mt-2 md:col-span-1 md:col-start-4 md:row-start-1 md:mt-0',
          INVALID_FOCUS,
        ]"
        type="text"
        autocomplete="off"
        aria-label="Description"
        placeholder="e.g. Weekly groceries"
        :maxlength="TRANSACTION_DESCRIPTION_MAX_LENGTH"
        :disabled="disabled"
        v-bind="invalidProps('description')"
        @update:model-value="update('description', $event)"
        @keydown.enter.prevent="emit('next')"
      />

      <Button
        v-if="removable"
        class="col-start-3 row-start-1 md:col-start-5"
        variant="ghost"
        size="icon-sm"
        type="button"
        aria-label="Remove expense"
        :disabled="disabled"
        @click="emit('remove')"
      >
        <X />
      </Button>

      <p
        v-if="draft.errors.amount"
        :id="errorId('amount')"
        :class="[ERROR_CLASS, 'col-start-1 row-start-2']"
      >
        {{ draft.errors.amount }}
      </p>
      <p
        v-if="draft.errors.sharedCategoryId"
        :id="errorId('sharedCategoryId')"
        :class="[ERROR_CLASS, 'col-start-2 row-start-2']"
      >
        {{ draft.errors.sharedCategoryId }}
      </p>
      <p
        v-if="draft.errors.description"
        :id="errorId('description')"
        :class="[
          ERROR_CLASS,
          'col-span-2 col-start-2 row-start-4 md:col-span-1 md:col-start-4 md:row-start-2',
        ]"
      >
        {{ draft.errors.description }}
      </p>
    </div>
  </div>
</template>
