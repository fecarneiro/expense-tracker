<script setup lang="ts">
import {
  type CreateSharedExpenseRequest,
  SHARED_EXPENSES_BATCH_MAX,
} from '@expense-tracker/contracts'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import SharedExpenseDraftRow from '@/modules/partners/shared-expenses/components/SharedExpenseDraftRow.vue'
import { useSharedCategoriesQuery } from '@/modules/partners/shared-expenses/queries/shared-categories.queries'
import {
  createDraft,
  draftAmountCents,
  prepareBatch,
  summarizeDrafts,
} from '@/modules/partners/shared-expenses/rules/shared-expense.rules'
import { useUserFormat } from '@/shared/composables/useUserFormat'
import { Button } from '@/shared/ui/button'

defineProps<{
  submitting: boolean
  submitFailed: boolean
}>()

const emit = defineEmits<{
  cancel: []
  submit: [requests: CreateSharedExpenseRequest[]]
}>()

const { money, decimalSeparator } = useUserFormat()
const amountPlaceholder = `0${decimalSeparator}00`

const list = useTemplateRef('list')
const drafts = ref([createDraft()])

const {
  data: categoriesData,
  isLoading: loadingCategories,
  isLoadingError: categoriesFailed,
  refetch: refetchCategories,
} = useSharedCategoriesQuery()

const categories = computed(() => categoriesData.value ?? [])
const summary = computed(() => summarizeDrafts(drafts.value))
const invalidCount = computed(
  () => drafts.value.filter((draft) => Object.keys(draft.errors).length > 0).length,
)
const canAdd = computed(() => drafts.value.length < SHARED_EXPENSES_BATCH_MAX)
const submitLabel = computed(() =>
  summary.value.count === 1 ? 'Add expense' : `Add ${summary.value.count} expenses`,
)

async function focusAmount(clientId: string | undefined) {
  await nextTick()
  list.value?.querySelector<HTMLElement>(`[data-amount="${clientId}"]`)?.focus()
}

async function focusNextInvalid() {
  await nextTick()
  const fields = [...(list.value?.querySelectorAll<HTMLElement>('[aria-invalid="true"]') ?? [])]
  const current = fields.indexOf(document.activeElement as HTMLElement)
  fields[(current + 1) % fields.length]?.focus()
}

async function addDraft() {
  const draft = createDraft(drafts.value.at(-1)?.split)
  drafts.value.push(draft)
  await focusAmount(draft.clientId)
  list.value?.scrollTo({ top: list.value.scrollHeight })
}

function goToNext(index: number) {
  const current = drafts.value[index]
  const next = drafts.value[index + 1]

  if (next) void focusAmount(next.clientId)
  else if (current && draftAmountCents(current) > 0 && canAdd.value) void addDraft()
}

function removeDraft(index: number) {
  const [removed] = drafts.value.splice(index, 1)
  if (removed) void focusAmount((drafts.value[index] ?? drafts.value[index - 1])?.clientId)
}

function submit() {
  const batch = prepareBatch(drafts.value)
  drafts.value = batch.drafts

  if (batch.requests) emit('submit', batch.requests)
  else void focusNextInvalid()
}

watch(
  loadingCategories,
  (loading) => {
    if (!loading && categories.value.length > 0) void focusAmount(drafts.value[0]?.clientId)
  },
  { immediate: true },
)
</script>

<template>
  <form class="flex min-h-0 flex-1 flex-col" novalidate @submit.prevent="submit">
    <p v-if="loadingCategories" class="text-muted-foreground flex-1 p-6 text-center">
      Loading shared categories...
    </p>
    <div
      v-else-if="categoriesFailed"
      class="text-destructive flex-1 space-y-3 p-6 text-center"
      role="alert"
    >
      <p>Unable to load shared categories.</p>
      <Button variant="outline" type="button" @click="refetchCategories()">Try again</Button>
    </div>
    <p
      v-else-if="categories.length === 0"
      class="text-destructive flex-1 p-6 text-center"
      role="alert"
    >
      Create a shared category before adding an expense.
    </p>

    <template v-else>
      <div
        class="bg-muted text-muted-foreground hidden shrink-0 grid-cols-[7rem_minmax(9rem,1fr)_8rem_minmax(10rem,1.4fr)_2rem] gap-2 border-y px-6 py-2 text-[0.8125rem] font-medium md:grid"
        aria-hidden="true"
      >
        <span>Amount</span>
        <span>Category</span>
        <span>Split</span>
        <span>Description (optional)</span>
      </div>

      <div ref="list" class="min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-4 md:px-6">
        <SharedExpenseDraftRow
          v-for="(draft, index) in drafts"
          :key="draft.clientId"
          :model-value="draft"
          :categories="categories"
          :amount-placeholder="amountPlaceholder"
          :disabled="submitting"
          :removable="drafts.length > 1"
          @update:model-value="drafts[index] = $event"
          @next="goToNext(index)"
          @remove="removeDraft(index)"
        />

        <Button
          class="text-you mt-2 border-dashed"
          variant="outline"
          size="sm"
          type="button"
          :disabled="submitting || !canAdd"
          @click="addDraft"
        >
          + Add another expense
        </Button>
      </div>
    </template>

    <div
      class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-4 py-4 md:px-6"
    >
      <div class="text-muted-foreground text-sm tabular-nums" aria-live="polite">
        <button
          v-if="invalidCount > 0"
          class="text-destructive block font-semibold underline-offset-2 hover:underline"
          type="button"
          @click="focusNextInvalid"
        >
          {{ invalidCount }} {{ invalidCount === 1 ? 'expense needs' : 'expenses need' }} attention
        </button>
        <p v-if="submitFailed" class="text-destructive font-semibold" role="alert">
          Unable to add the expenses. Nothing was saved.
        </p>
        <p>
          {{ summary.count }} {{ summary.count === 1 ? 'expense' : 'expenses' }},
          <strong class="text-foreground font-semibold">{{ money(summary.totalCents) }}</strong>
          total. Partner owes
          <strong class="text-foreground font-semibold">{{
            money(summary.partnerOwesCents)
          }}</strong
          >.
        </p>
      </div>

      <div class="flex gap-2 max-md:w-full">
        <Button
          class="max-md:flex-1"
          variant="outline"
          type="button"
          :disabled="submitting"
          @click="emit('cancel')"
        >
          Cancel
        </Button>
        <Button
          class="max-md:flex-1"
          type="submit"
          :disabled="submitting || loadingCategories || categories.length === 0"
        >
          {{ submitting ? 'Adding...' : submitLabel }}
        </Button>
      </div>
    </div>
  </form>
</template>
