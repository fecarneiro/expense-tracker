<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { computed, ref } from 'vue'
import SharedExpenseCreateDialog from '@/modules/partners/shared-expenses/components/SharedExpenseCreateDialog.vue'
import SharedExpensesBalance from '@/modules/partners/shared-expenses/components/SharedExpensesBalance.vue'
import SharedExpensesFilters from '@/modules/partners/shared-expenses/components/SharedExpensesFilters.vue'
import SharedExpensesTable from '@/modules/partners/shared-expenses/components/SharedExpensesTable.vue'
import { useSharedExpensesReport } from '@/modules/partners/shared-expenses/composables/useSharedExpensesReport'
import { usePartnershipQuery } from '@/modules/partners/shared-expenses/queries/partnerships.queries'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

const creating = ref(false)

const {
  data: partnership,
  isPending: partnershipLoading,
  isLoadingError: partnershipFailed,
} = usePartnershipQuery()

const partnerUserId = computed(() => partnership.value?.partnerId ?? '')
const { rows, total, loading, isError, filters, pagination, resetPage } = useSharedExpensesReport(
  computed(() => !!partnerUserId.value),
)
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Shared expenses</h1>
      <Button :disabled="!partnerUserId" @click="creating = true">
        <Plus />
        Add expense
      </Button>
    </header>

    <p v-if="partnershipLoading" class="text-muted-foreground">Loading...</p>
    <p v-else-if="partnershipFailed" class="text-destructive" role="alert">
      Unable to load partnership.
    </p>
    <template v-else>
      <SharedExpensesBalance v-if="partnerUserId" />
      <Card class="@container gap-0 overflow-hidden rounded-lg py-0 shadow-none">
        <SharedExpensesFilters v-model="filters" :partner-user-id />
        <SharedExpensesTable
          v-model:pagination="pagination"
          :rows
          :total
          :loading
          :failed="isError"
          :partner-user-id
          :show-status="filters.status === ''"
        />
      </Card>
    </template>

    <SharedExpenseCreateDialog v-model:open="creating" @created="resetPage" />
  </section>
</template>
