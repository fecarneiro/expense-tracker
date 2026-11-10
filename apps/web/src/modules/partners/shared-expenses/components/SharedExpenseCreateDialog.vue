<script setup lang="ts">
import type { CreateSharedExpenseRequest } from '@expense-tracker/contracts'
import { watch } from 'vue'
import SharedExpenseCreateForm from '@/modules/partners/shared-expenses/components/SharedExpenseCreateForm.vue'
import { useCreateSharedExpensesMutation } from '@/modules/partners/shared-expenses/queries/shared-expenses.queries'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { required: true })

const {
  mutate: createExpenses,
  isPending: submitting,
  isError: submitFailed,
  reset,
} = useCreateSharedExpensesMutation()

watch(open, (isOpen) => {
  if (isOpen) reset()
})

function onOpenChange(value: boolean) {
  if (!submitting.value) open.value = value
}

function submit(requests: CreateSharedExpenseRequest[]) {
  createExpenses(requests, {
    onSuccess: () => {
      open.value = false
      emit('created')
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent
      class="bg-card flex h-[min(85dvh,46rem)] flex-col gap-0 p-0 sm:max-w-4xl max-md:h-dvh max-md:max-w-none max-md:rounded-none max-md:border-0"
      @open-auto-focus.prevent
    >
      <DialogHeader class="shrink-0 gap-1 px-4 py-4 pr-12 text-left max-md:border-b md:px-6">
        <DialogTitle>Add shared expenses</DialogTitle>
        <DialogDescription>
          You paid these. Full: Partner owes everything. Half: you split it equally.
        </DialogDescription>
      </DialogHeader>

      <SharedExpenseCreateForm
        :submitting="submitting"
        :submit-failed="submitFailed"
        @cancel="open = false"
        @submit="submit"
      />
    </DialogContent>
  </Dialog>
</template>
