<script setup lang="ts">
import type { PendingBalance } from '@expense-tracker/contracts'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { computed, onMounted, ref } from 'vue'
import {
  getPendingBalance,
  settlePendingBalance,
} from '@/modules/shared-expenses/api/shared-expenses.api'
import { getAuthUser } from '@/shared/auth/auth.session'
import { formatMoney } from '@/utils/format-money'

const emit = defineEmits<{
  settled: []
}>()

const confirm = useConfirm()
const user = getAuthUser()

const balance = ref<PendingBalance | null>(null)
const loading = ref(true)
const settling = ref(false)
const errorMessage = ref<string | null>(null)

const totalAmountCents = computed(() => balance.value?.totalAmountCents ?? 0)

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

async function loadBalance() {
  loading.value = true
  errorMessage.value = null

  try {
    balance.value = await getPendingBalance()
  } catch {
    balance.value = null
    errorMessage.value = 'Unable to load balance.'
  } finally {
    loading.value = false
  }
}

async function settle() {
  if (!canSettle.value || settling.value) {
    return
  }

  settling.value = true
  errorMessage.value = null

  try {
    await settlePendingBalance()

    await loadBalance()
    emit('settled')
  } catch {
    errorMessage.value = 'Unable to settle.'
  } finally {
    settling.value = false
  }
}

function requestSettlement() {
  if (!canSettle.value || settling.value) {
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

onMounted(() => {
  void loadBalance()
})

defineExpose({
  reload: loadBalance,
})
</script>

<template>
  <Card class="balance-card">
    <template #title>Open balance</template>

    <template #content>
      <div v-if="loading" class="balance-loading">
        <Skeleton width="8rem" height="2rem" />
        <Skeleton width="12rem" />
      </div>

      <Message v-else-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <div v-else class="balance-content">
        <div class="balance-details">
          <Tag :value="summary" :severity="balanceSeverity" />

          <p class="balance-amount">
            {{ amountLabel }}
          </p>
        </div>

        <Button
          v-if="canSettle"
          class="balance-settle-button"
          label="Settle"
          :loading="settling"
          :disabled="settling"
          @click="requestSettlement"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.balance-card {
  align-self: flex-start;
  width: 100%;
  max-width: 24rem;
}

.balance-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.balance-details,
.balance-loading {
  display: grid;
  gap: 0.5rem;
}

.balance-amount {
  margin: 0;
  color: var(--p-text-color);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

@media (max-width: 640px) {
  .balance-card {
    max-width: none;
  }

  .balance-content {
    align-items: stretch;
    flex-direction: column;
  }

  .balance-settle-button {
    width: 100%;
  }
}
</style>
