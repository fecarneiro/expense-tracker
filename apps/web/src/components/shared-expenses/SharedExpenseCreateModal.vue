<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { apiRequest } from '@/api/http'
import { getAuthUser } from '@/auth/auth.session'
import { formatMoney } from '@/utils/format-money'

type SharedCategory = {
  id: string
  name: string
}

type ExpenseErrors = {
  amount?: string
  category?: string
  description?: string
}

type SharedExpenseDraft = {
  clientId: string
  amount: string
  sharedCategoryId: string
  split: 'half' | 'full'
  description: string
  errors: ExpenseErrors
}

type CreateSharedExpensePayload = {
  totalAmountCents: number
  sharedCategoryId: string
  split: 'half' | 'full'
  description?: string
}

const emit = defineEmits<{
  created: []
}>()

const user = getAuthUser()
const dialog = ref<HTMLDialogElement | null>(null)
const categories = ref<SharedCategory[]>([])
const expenses = ref<SharedExpenseDraft[]>([])
const loadingCategories = ref(false)
const submitting = ref(false)
const categoriesError = ref<string | null>(null)
const submitError = ref<string | null>(null)

function numberSeparators(locale?: string) {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234.5)
    return {
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
      group: parts.find((part) => part.type === 'group')?.value ?? ',',
    }
  } catch {
    return { decimal: '.', group: ',' }
  }
}

const separators = numberSeparators(user?.locale)
const amountPlaceholder = `0${separators.decimal}00`

function newExpense(): SharedExpenseDraft {
  return {
    clientId: crypto.randomUUID(),
    amount: '',
    sharedCategoryId: '',
    split: 'full',
    description: '',
    errors: {},
  }
}

function parseAmountCents(value: string): number | null {
  const normalized = value
    .trim()
    .replaceAll(separators.group, '')
    .replace(separators.decimal, '.')
    .replaceAll(/\s/g, '')

  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null

  const cents = Math.round(Number(normalized) * 100)
  return Number.isSafeInteger(cents) ? cents : null
}

function amountCents(expense: SharedExpenseDraft): number {
  const cents = parseAmountCents(expense.amount)
  return cents != null && cents > 0 ? cents : 0
}

function partnerAmountCents(expense: SharedExpenseDraft): number {
  const total = amountCents(expense)
  return expense.split === 'full' ? total : Math.floor(total / 2)
}

function formattedMoney(cents: number): string {
  return formatMoney(cents, user?.currency, user?.locale)
}

const totalAmountCents = computed(() =>
  expenses.value.reduce((total, expense) => total + amountCents(expense), 0),
)

const submitLabel = computed(() =>
  expenses.value.length === 1 ? 'Add expense' : `Add ${expenses.value.length} expenses`,
)

const canSubmit = computed(
  () =>
    !loadingCategories.value &&
    !submitting.value &&
    categories.value.length > 0 &&
    expenses.value.length > 0,
)

function clearError(expense: SharedExpenseDraft, field: keyof ExpenseErrors) {
  delete expense.errors[field]
  submitError.value = null
}

async function focusFirstAmount() {
  await nextTick()
  const amountInputs = dialog.value?.querySelectorAll<HTMLInputElement>('.amount-input')
  const lastAmountInput = amountInputs?.item(amountInputs.length - 1)
  lastAmountInput?.focus()
}

function addExpense() {
  expenses.value.push(newExpense())
  void focusFirstAmount()
}

function removeExpense(clientId: string) {
  if (expenses.value.length === 1) return
  expenses.value = expenses.value.filter((expense) => expense.clientId !== clientId)
}

function validateExpense(expense: SharedExpenseDraft): CreateSharedExpensePayload | null {
  const errors: ExpenseErrors = {}
  const totalAmountCents = parseAmountCents(expense.amount)
  const description = expense.description.trim()

  if (!expense.amount.trim()) {
    errors.amount = 'Enter an amount.'
  } else if (totalAmountCents == null) {
    errors.amount = 'Enter a valid amount with up to 2 decimal places.'
  } else if (totalAmountCents <= 0) {
    errors.amount = 'Enter an amount greater than zero.'
  }
  if (!expense.sharedCategoryId) errors.category = 'Choose a category.'
  if (description.length > 70) errors.description = 'Use at most 70 characters.'

  expense.errors = errors

  if (Object.keys(errors).length > 0 || totalAmountCents == null) return null

  return {
    totalAmountCents,
    sharedCategoryId: expense.sharedCategoryId,
    split: expense.split,
    ...(description ? { description } : {}),
  }
}

async function submit() {
  submitError.value = null

  const payloads = expenses.value.map(validateExpense)
  const firstInvalidIndex = payloads.findIndex((payload) => payload == null)

  if (firstInvalidIndex >= 0) {
    await nextTick()
    const invalidField = dialog.value?.querySelector<HTMLElement>(
      `.expense-card:nth-of-type(${firstInvalidIndex + 1}) [aria-invalid="true"]`,
    )
    invalidField?.focus()
    return
  }

  submitting.value = true
  try {
    await apiRequest('/shared-expenses/batch', {
      method: 'POST',
      body: JSON.stringify({ expenses: payloads }),
    })
    dialog.value?.close()
    emit('created')
  } catch {
    submitError.value = 'Unable to add the expenses. Nothing was saved.'
  } finally {
    submitting.value = false
  }
}

async function loadCategories() {
  loadingCategories.value = true
  categoriesError.value = null

  try {
    categories.value = await apiRequest<SharedCategory[]>('/shared-categories')
    if (categories.value.length === 0) {
      categoriesError.value = 'Create a shared category before adding an expense.'
    }
  } catch {
    categories.value = []
    categoriesError.value = 'Unable to load shared categories.'
  } finally {
    loadingCategories.value = false
  }

  if (categories.value.length > 0) void focusFirstAmount()
}

function close() {
  if (submitting.value) return
  dialog.value?.close()
}

function onCancel(event: Event) {
  if (submitting.value) event.preventDefault()
}

function open() {
  expenses.value = [newExpense()]
  submitError.value = null
  categoriesError.value = null
  dialog.value?.showModal()
  void loadCategories()
  void focusFirstAmount()
}

defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialog"
    class="create-dialog"
    aria-labelledby="create-dialog-title"
    @cancel="onCancel"
  >
    <form class="create-form" @submit.prevent="submit">
      <header class="create-header">
        <div>
          <h2 id="create-dialog-title">Add shared expenses</h2>
          <p>You paid these expenses. Choose how each one should be split.</p>
        </div>
        <button
          class="close-button"
          type="button"
          aria-label="Close"
          :disabled="submitting"
          @click="close"
        >
          ×
        </button>
      </header>

      <div class="create-body">
        <p v-if="loadingCategories" class="modal-state">Loading shared categories...</p>
        <div v-else-if="categoriesError" class="modal-state modal-state--error" role="alert">
          <p>{{ categoriesError }}</p>
          <button
            v-if="categories.length === 0"
            class="secondary-button"
            type="button"
            @click="loadCategories"
          >
            Try again
          </button>
        </div>

        <template v-else>
          <article
            v-for="(expense, index) in expenses"
            :key="expense.clientId"
            class="expense-card"
          >
            <div class="expense-card-header">
              <strong>Expense {{ index + 1 }}</strong>
              <button
                v-if="expenses.length > 1"
                class="remove-button"
                type="button"
                :aria-label="`Remove expense ${index + 1}`"
                :disabled="submitting"
                @click="removeExpense(expense.clientId)"
              >
                Remove
              </button>
            </div>

            <div class="expense-grid">
              <label class="field">
                <span>Amount</span>
                <input
                  v-model="expense.amount"
                  class="amount-input"
                  type="text"
                  inputmode="decimal"
                  :placeholder="amountPlaceholder"
                  autocomplete="off"
                  :aria-invalid="expense.errors.amount ? 'true' : undefined"
                  :aria-describedby="
                    expense.errors.amount ? `amount-error-${expense.clientId}` : undefined
                  "
                  :disabled="submitting"
                  @input="clearError(expense, 'amount')"
                >
                <small
                  v-if="expense.errors.amount"
                  :id="`amount-error-${expense.clientId}`"
                  class="field-error"
                >
                  {{ expense.errors.amount }}
                </small>
              </label>

              <label class="field">
                <span>Category</span>
                <select
                  v-model="expense.sharedCategoryId"
                  :aria-invalid="expense.errors.category ? 'true' : undefined"
                  :aria-describedby="
                    expense.errors.category ? `category-error-${expense.clientId}` : undefined
                  "
                  :disabled="submitting"
                  @change="clearError(expense, 'category')"
                >
                  <option value="" disabled>Select a category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <small
                  v-if="expense.errors.category"
                  :id="`category-error-${expense.clientId}`"
                  class="field-error"
                >
                  {{ expense.errors.category }}
                </small>
              </label>

              <fieldset class="split-field">
                <legend>Split</legend>
                <div class="split-options">
                  <label :class="{ 'split-option--selected': expense.split === 'full' }">
                    <input
                      v-model="expense.split"
                      type="radio"
                      :name="`split-${expense.clientId}`"
                      value="full"
                      :disabled="submitting"
                    >
                    Partner owes full amount
                  </label>
                  <label :class="{ 'split-option--selected': expense.split === 'half' }">
                    <input
                      v-model="expense.split"
                      type="radio"
                      :name="`split-${expense.clientId}`"
                      value="half"
                      :disabled="submitting"
                    >
                    Split equally
                  </label>
                </div>
                <small class="split-summary">
                  Partner owes {{ formattedMoney(partnerAmountCents(expense)) }}
                </small>
              </fieldset>

              <label class="field field--wide">
                <span>Description <small>(optional)</small></span>
                <input
                  v-model="expense.description"
                  type="text"
                  maxlength="70"
                  placeholder="e.g. Weekly groceries"
                  :aria-invalid="expense.errors.description ? 'true' : undefined"
                  :aria-describedby="
                    expense.errors.description
                      ? `description-error-${expense.clientId}`
                      : undefined
                  "
                  :disabled="submitting"
                  @input="clearError(expense, 'description')"
                >
                <small
                  v-if="expense.errors.description"
                  :id="`description-error-${expense.clientId}`"
                  class="field-error"
                >
                  {{ expense.errors.description }}
                </small>
              </label>
            </div>
          </article>

          <button
            class="add-another-button"
            type="button"
            :disabled="submitting || expenses.length >= 20"
            @click="addExpense"
          >
            <span aria-hidden="true">+</span>
            Add another expense
          </button>
        </template>

        <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
      </div>

      <footer class="create-footer">
        <span class="total-summary">
          {{ expenses.length }} {{ expenses.length === 1 ? 'expense' : 'expenses' }} ·
          {{ formattedMoney(totalAmountCents) }}
        </span>
        <div class="footer-actions">
          <button class="secondary-button" type="button" :disabled="submitting" @click="close">
            Cancel
          </button>
          <button class="primary-button" type="submit" :disabled="!canSubmit">
            {{ submitting ? 'Adding...' : submitLabel }}
          </button>
        </div>
      </footer>
    </form>
  </dialog>
</template>

<style scoped>
.create-dialog {
  width: min(48rem, calc(100% - var(--space-6)));
  max-height: calc(100dvh - var(--space-6));
  padding: 0;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  box-shadow: 0 1.5rem 4rem rgb(15 23 42 / 20%);
}

.create-dialog::backdrop {
  background: rgb(15 23 42 / 45%);
}

.create-form {
  display: flex;
  max-height: calc(100dvh - var(--space-6));
  flex-direction: column;
}

.create-header,
.create-footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
}

.create-header {
  align-items: flex-start;
  border-bottom: 1px solid var(--color-border);
}

.create-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.create-header p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.close-button {
  display: grid;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  padding: 0;
  place-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 1.5rem;
  line-height: 1;
}

.close-button:hover:not(:disabled) {
  background: var(--color-background);
  color: var(--color-text);
}

.create-body {
  display: flex;
  min-height: 0;
  padding: var(--space-4) var(--space-6);
  overflow-y: auto;
  flex-direction: column;
  gap: var(--space-4);
}

.expense-card {
  padding: var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.expense-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.remove-button {
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  font-size: 0.8125rem;
  font-weight: 600;
}

.remove-button:hover:not(:disabled) {
  background: var(--color-surface);
}

.expense-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.field--wide,
.split-field {
  grid-column: 1 / -1;
}

.field span small {
  font-weight: 400;
}

.field input,
.field select {
  width: 100%;
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-weight: 400;
}

.field input:focus,
.field select:focus {
  border-color: var(--color-primary);
}

.field input[aria-invalid="true"],
.field select[aria-invalid="true"] {
  border-color: var(--color-danger);
}

.field-error,
.submit-error {
  color: var(--color-danger);
  font-size: 0.8125rem;
  font-weight: 400;
}

.split-field {
  min-width: 0;
  padding: 0;
  border: 0;
}

.split-field legend {
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.split-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.split-options label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
}

.split-options label:has(input:focus-visible) {
  outline: 0.1875rem solid var(--color-primary);
  outline-offset: 0.125rem;
}

.split-options input {
  margin: 0;
}

.split-options .split-option--selected {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.split-summary {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-muted);
}

.add-another-button {
  align-self: flex-start;
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-weight: 600;
}

.add-another-button:hover:not(:disabled) {
  background: var(--color-background);
  border-color: var(--color-primary);
}

.submit-error {
  margin: 0;
}

.modal-state {
  display: grid;
  min-height: 10rem;
  margin: 0;
  place-items: center;
  color: var(--color-text-muted);
  text-align: center;
}

.modal-state--error {
  align-content: center;
  gap: var(--space-3);
  color: var(--color-danger);
}

.modal-state--error p {
  margin: 0;
}

.create-footer {
  border-top: 1px solid var(--color-border);
}

.total-summary {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.footer-actions {
  display: flex;
  gap: var(--space-2);
}

.primary-button,
.secondary-button {
  padding: var(--space-2) var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.primary-button {
  background: var(--color-primary);
  color: white;
}

.secondary-button {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

@media (max-width: 40rem) {
  .create-header,
  .create-body,
  .create-footer {
    padding-right: var(--space-4);
    padding-left: var(--space-4);
  }

  .expense-grid,
  .split-options {
    grid-template-columns: 1fr;
  }

  .create-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .footer-actions,
  .footer-actions button {
    flex: 1;
  }
}
</style>
