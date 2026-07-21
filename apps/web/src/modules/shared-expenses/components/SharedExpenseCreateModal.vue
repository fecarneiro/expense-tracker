<script setup lang="ts">
import {
  type CreateSharedExpenseFormValues,
  createSharedExpenseFormSchema,
  type SharedExpenseSplit,
} from '@expense-tracker/contracts'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import { computed, ref } from 'vue'
import { getAuthUser } from '@/modules/auth/auth.session'
import {
  useCreateSharedExpensesMutation,
  useSharedCategoriesQuery,
} from '@/modules/shared-expenses/api/shared-expenses.queries'

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
const formKey = ref(0)

const emit = defineEmits<{
  created: []
}>()

const initialValues = {
  amount: null,
  sharedCategoryId: '',
  split: 'full' as SharedExpenseSplit,
  description: '',
}

const resolver = zodResolver(createSharedExpenseFormSchema)

const categoriesQuery = useSharedCategoriesQuery(visible)
const createMutation = useCreateSharedExpensesMutation()

const categories = computed(() => categoriesQuery.data.value ?? [])

const categoriesError = computed(() => {
  if (categoriesQuery.isError.value) {
    return 'Unable to load shared categories.'
  }

  if (categoriesQuery.isSuccess.value && categories.value.length === 0) {
    return 'Create a shared category before adding an expense.'
  }

  return null
})

const canSubmit = computed(
  () =>
    !categoriesQuery.isPending.value &&
    !createMutation.isPending.value &&
    categories.value.length > 0,
)

async function submit(event: FormSubmitEvent): Promise<void> {
  if (!event.valid) {
    return
  }

  const values = event.values as CreateSharedExpenseFormValues
  const totalAmountCents = Math.round(values.amount * 100)

  try {
    await createMutation.mutateAsync({
      totalAmountCents,
      sharedCategoryId: values.sharedCategoryId,
      split: values.split,
      description: values.description,
    })

    visible.value = false
    emit('created')
  } catch {
    // error surfaced via createMutation.isError
  }
}

function close() {
  if (createMutation.isPending.value) {
    return
  }

  visible.value = false
}

function open() {
  formKey.value += 1
  createMutation.reset()
  visible.value = true
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
    :closable="!createMutation.isPending.value"
    :close-on-escape="!createMutation.isPending.value"
    :dismissable-mask="false"
    :style="{ width: '32rem' }"
    :breakpoints="{
      '640px': 'calc(100vw - var(--space-8))',
    }"
  >
    <Form
      :key="formKey"
      id="shared-expense-create-form"
      v-slot="$form"
      class="create-form"
      :initial-values="initialValues"
      :resolver="resolver"
      :validate-on-value-update="false"
      @submit="submit"
    >
      <Message v-if="categoriesError" severity="error" :closable="false">
        {{ categoriesError }}
      </Message>

      <Button
        v-if="categoriesQuery.isError.value"
        type="button"
        label="Try again"
        icon="pi pi-refresh"
        severity="secondary"
        variant="outlined"
        @click="categoriesQuery.refetch()"
      />

      <template v-if="!categoriesError">
        <div class="form-field">
          <span id="shared-expense-amount-label" class="field-label">Amount</span>

          <InputNumber
            name="amount"
            input-id="shared-expense-amount"
            aria-labelledby="shared-expense-amount-label"
            mode="currency"
            :currency="user?.currency ?? 'BRL'"
            :locale="user?.locale ?? 'pt-BR'"
            :min="0.01"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :disabled="createMutation.isPending.value"
            fluid
          />

          <Message v-if="$form.amount?.invalid" severity="error" size="small" variant="simple">
            <p v-for="(error, index) of $form.amount.errors" :key="index">
              {{ error.message }}
            </p>
          </Message>
        </div>

        <div class="form-field">
          <span id="shared-expense-category-label" class="field-label">Category</span>

          <Select
            name="sharedCategoryId"
            input-id="shared-expense-category"
            aria-labelledby="shared-expense-category-label"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="Select a category"
            :loading="categoriesQuery.isPending.value"
            :disabled="categoriesQuery.isPending.value || createMutation.isPending.value"
            fluid
          />

          <Message
            v-if="$form.sharedCategoryId?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            <p v-for="(error, index) of $form.sharedCategoryId.errors" :key="index">
              {{ error.message }}
            </p>
          </Message>
        </div>

        <div class="form-field">
          <span id="shared-expense-description-label" class="field-label">Description</span>
          <InputText
            name="description"
            input-id="shared-expense-description"
            aria-labelledby="shared-expense-description-label"
            placeholder="Optional"
            maxlength="70"
            :disabled="createMutation.isPending.value"
            fluid
          />

          <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
            <p v-for="(error, index) of $form.description.errors" :key="index">
              {{ error.message }}
            </p>
          </Message>
        </div>

        <fieldset class="split-field">
          <legend>Split</legend>

          <SelectButton
            name="split"
            :options="splitOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            :disabled="createMutation.isPending.value"
          />
        </fieldset>

        <Message v-if="createMutation.isError.value" severity="error" :closable="false">
          Unable to add expense.
        </Message>
      </template>
    </Form>

    <template #footer>
      <div class="dialog-actions">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          variant="text"
          :disabled="createMutation.isPending.value"
          @click="close"
        />

        <Button
          type="submit"
          form="shared-expense-create-form"
          label="Add expense"
          icon="pi pi-plus"
          :loading="createMutation.isPending.value"
          :disabled="!canSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.create-form {
  display: grid;
  gap: var(--space-4);
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
