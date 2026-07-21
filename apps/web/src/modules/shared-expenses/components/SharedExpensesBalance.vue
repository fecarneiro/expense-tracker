<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { computed } from 'vue'
import { getAuthUser } from '@/modules/auth/auth.session'
import {
  usePendingBalanceQuery,
  useSettlePendingBalanceMutation,
} from '@/modules/shared-expenses/api/shared-expenses.queries'
import { formatMoney } from '@/utils/format-money'

const confirm = useConfirm()
const user = getAuthUser()

const balanceQuery = usePendingBalanceQuery()
const settleMutation = useSettlePendingBalanceMutation()

const totalAmountCents = computed(() => balanceQuery.data.value?.totalAmountCents ?? 0)

const amountLabel = computed(() =>
  formatMoney(Math.abs(totalAmountCents.value), user?.currency, user?.locale),
)

const summary = computed(() => {
  if (totalAmountCents.value > 0) {
    return 'You owe Partner'
  }

  if (totalAmountCents.value < 0) {
    return 'Partner owes you'
  }

  return 'Settled up'
})

const balanceSeverity = computed<'warn' | 'success' | 'secondary'>(() => {
  if (totalAmountCents.value > 0) {
    return 'warn'
  }

  if (totalAmountCents.value < 0) {
    return 'success'
  }

  return 'secondary'
})

const canSettle = computed(() => totalAmountCents.value > 0)

async function settle(): Promise<void> {
  if (!canSettle.value || settleMutation.isPending.value) {
    return
  }

  try {
    await settleMutation.mutateAsync()
  } catch {
    // error surfaced via settleMutation.isError
  }
}

function requestSettlement() {
  if (!canSettle.value || settleMutation.isPending.value) {
    return
  }

  confirm.require({
    header: 'Settle balance',
    message: `Confirm settlement of ${amountLabel.value}?`,
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => {
      void settle()
    },
  })
}
</script>

<template>
  <Card class="balance-card">
    <template #title>Open balance</template>

    <template #content>
      <div v-if="balanceQuery.isPending.value" class="balance-loading">
        <Skeleton width="10rem" height="2rem" />
        <Skeleton width="8rem" />
      </div>

      <Message v-else-if="balanceQuery.isError.value" severity="error" :closable="false">
        Unable to load balance.
      </Message>

      <div v-else class="balance-content">
        <p class="balance-amount">
          {{ amountLabel }}
        </p>

        <Tag :value="summary" :severity="balanceSeverity" />

        <Message v-if="settleMutation.isError.value" severity="error" :closable="false">
          Unable to settle.
        </Message>

        <Button
          v-if="canSettle"
          class="balance-settle-button"
          label="Settle"
          :loading="settleMutation.isPending.value"
          :disabled="settleMutation.isPending.value"
          @click="requestSettlement"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.balance-card {
  align-self: flex-start;
  width: fit-content;
  min-width: 16rem;
  max-width: 100%;
}

.balance-content,
.balance-loading {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
}

.balance-amount {
  margin: 0;
  color: var(--p-text-color);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.balance-settle-button {
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .balance-card {
    width: 100%;
  }

  .balance-settle-button {
    width: 100%;
  }
}
</style>
