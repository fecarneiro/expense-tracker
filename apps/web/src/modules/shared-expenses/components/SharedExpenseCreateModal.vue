<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import { computed, ref } from 'vue'
import {
  type CreateSharedExpensePayload,
  createSharedExpense,
  listSharedCategories,
  type SharedCategory,
  type SharedExpenseSplit,
} from '@/modules/shared-expenses/api/shared-expenses.api'
import { getAuthUser } from '@/shared/auth/auth.session'

type FormErrors = {
  amount?: string
  category?: string
}

const emit = defineEmits<{
  created: []
}>()

const splitOptions: Array<{
  label: string
  value: SharedExpenseSplit
}> = [
  {
    label: 'Full amount',
    value: 'full',
  },
  {
    label: 'Split equally',
    value: 'half',
  },
]

const user = getAuthUser()

const visible = ref(false)
const categories = ref<SharedCategory[]>([])

const amount = ref<number | null>(null)
const sharedCategoryId = ref('')
const split = ref<SharedExpenseSplit>('full')

const errors = ref<FormErrors>({})

const loadingCategories = ref(false)
const categoriesLoadFailed = ref(false)
const categoriesError = ref<string | null>(null)

const submitting = ref(false)
const submitError = ref<string | null>(null)

const canSubmit = computed(
  () => !loadingCategories.value && !submitting.value && categories.value.length > 0,
)

function resetForm() {
  amount.value = null
  sharedCategoryId.value = ''
  split.value = 'full'

  errors.value = {}
  submitError.value = null
}

function clearError(field: keyof FormErrors) {
  delete errors.value[field]
  submitError.value = null
}

function validate(): CreateSharedExpensePayload | null {
  const nextErrors: FormErrors = {}

  const totalAmountCents = amount.value == null ? null : Math.round(amount.value * 100)

  if (
    totalAmountCents == null ||
    !Number.isSafeInteger(totalAmountCents) ||
    totalAmountCents <= 0
  ) {
    nextErrors.amount = 'Enter an amount greater than zero.'
  }

  if (!sharedCategoryId.value) {
    nextErrors.category = 'Choose a category.'
  }

  errors.value = nextErrors

  if (Object.keys(nextErrors).length > 0 || totalAmountCents == null) {
    return null
  }

  return {
    totalAmountCents,
    sharedCategoryId: sharedCategoryId.value,
    split: split.value,
  }
}

async function loadCategories() {
  loadingCategories.value = true
  categoriesLoadFailed.value = false
  categoriesError.value = null

  try {
    categories.value = await listSharedCategories()

    if (categories.value.length === 0) {
      categoriesError.value = 'Create a shared category before adding an expense.'
    }
  } catch {
    categories.value = []
    categoriesLoadFailed.value = true
    categoriesError.value = 'Unable to load shared categories.'
  } finally {
    loadingCategories.value = false
  }
}

async function submit() {
  if (submitting.value) {
    return
  }

  submitError.value = null

  const expense = validate()

  if (!expense) {
    return
  }

  submitting.value = true

  try {
    await createSharedExpense(expense)

    visible.value = false
    emit('created')
  } catch {
    submitError.value = 'Unable to add expense.'
  } finally {
    submitting.value = false
  }
}

function close() {
  if (submitting.value) {
    return
  }

  visible.value = false
}

function open() {
  resetForm()

  categories.value = []
  categoriesError.value = null
  categoriesLoadFailed.value = false

  visible.value = true

  void loadCategories()
}

defineExpose({
  open,
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Add shared expense"
    modal
    :closable="!submitting"
    :close-on-escape="!submitting"
    :dismissable-mask="false"
    :style="{ width: '32rem' }"
    :breakpoints="{
      '640px': 'calc(100vw - 2rem)',
    }"
  >
    <form id="shared-expense-create-form" class="create-form" @submit.prevent="submit">
      <Message v-if="categoriesError" severity="error" :closable="false">
        {{ categoriesError }}
      </Message>

      <Button
        v-if="categoriesLoadFailed"
        type="button"
        label="Try again"
        icon="pi pi-refresh"
        severity="secondary"
        variant="outlined"
        @click="loadCategories"
      />

      <template v-if="!categoriesError">
        <div class="form-field">
          <span id="shared-expense-amount-label" class="field-label"> Amount </span>

          <InputNumber
            v-model="amount"
            input-id="shared-expense-amount"
            aria-labelledby="shared-expense-amount-label"
            mode="currency"
            :currency="user?.currency ?? 'BRL'"
            :locale="user?.locale ?? 'pt-BR'"
            :min="0.01"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :invalid="Boolean(errors.amount)"
            :disabled="submitting"
            fluid
            @update:model-value="clearError('amount')"
          />

          <Message v-if="errors.amount" severity="error" size="small" variant="simple">
            {{ errors.amount }}
          </Message>
        </div>

        <div class="form-field">
          <span id="shared-expense-category-label" class="field-label"> Category </span>

          <Select
            v-model="sharedCategoryId"
            input-id="shared-expense-category"
            aria-labelledby="shared-expense-category-label"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="Select a category"
            :loading="loadingCategories"
            :invalid="Boolean(errors.category)"
            :disabled="loadingCategories || submitting"
            fluid
            @change="clearError('category')"
          />

          <Message v-if="errors.category" severity="error" size="small" variant="simple">
            {{ errors.category }}
          </Message>
        </div>

        <fieldset class="split-field">
          <legend>Split</legend>

          <SelectButton
            v-model="split"
            :options="splitOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            :disabled="submitting"
          />
        </fieldset>

        <Message v-if="submitError" severity="error" :closable="false">
          {{ submitError }}
        </Message>
      </template>
    </form>

    <template #footer>
      <div class="dialog-actions">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          variant="text"
          :disabled="submitting"
          @click="close"
        />

        <Button
          type="submit"
          form="shared-expense-create-form"
          label="Add expense"
          icon="pi pi-plus"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.create-form {
  display: grid;
  gap: 1rem;
}

.form-field {
  display: grid;
  gap: 0.375rem;
}

.field-label,
.split-field > legend {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  font-weight: 600;
}

.split-field {
  display: grid;
  gap: 0.375rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .dialog-actions {
    width: 100%;
  }

  .dialog-actions > * {
    flex: 1;
  }
}
</style>
