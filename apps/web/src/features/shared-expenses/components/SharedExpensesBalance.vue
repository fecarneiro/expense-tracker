<script setup lang="ts">
import type { PendingBalance } from '@expense-tracker/contracts'
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '@/api/http'
import { getAuthUser } from '@/shared/auth/auth.session'
import { formatMoney } from '@/utils/format-money'

const emit = defineEmits<{
  settled: []
}>()

const user = getAuthUser()

const balance = ref<PendingBalance | null>(null)
const loading = ref(true)
const confirming = ref(false)
const settling = ref(false)
const errorMessage = ref<string | null>(null)

const totalAmountCents = computed(() => balance.value?.totalAmountCents ?? 0)

const amountLabel = computed(() =>
  formatMoney(Math.abs(totalAmountCents.value), user?.currency, user?.locale),
)

const summary = computed(() => {
  if (totalAmountCents.value > 0) return 'You owe Partner'
  if (totalAmountCents.value < 0) return 'Partner owes you'
  return 'Settled up'
})

const canSettle = computed(() => totalAmountCents.value > 0)

async function loadBalance() {
  loading.value = true
  errorMessage.value = null
  confirming.value = false
  try {
    balance.value = await apiRequest<PendingBalance>('/settlements/balance')
  } catch {
    balance.value = null
    errorMessage.value = 'Unable to load balance.'
  } finally {
    loading.value = false
  }
}

async function settle() {
  if (!canSettle.value || settling.value) return

  settling.value = true
  errorMessage.value = null
  try {
    await apiRequest('/settlements', { method: 'POST' })
    await loadBalance()
    emit('settled')
  } catch {
    errorMessage.value = 'Unable to settle.'
    confirming.value = false
  } finally {
    settling.value = false
  }
}

onMounted(() => {
  void loadBalance()
})

defineExpose({ reload: loadBalance })
</script>

<template>
  <div class="balance">
    <p v-if="loading" class="balance-message">Loading balance...</p>
    <p v-else-if="errorMessage" class="balance-message balance-message--error">
      {{ errorMessage }}
    </p>
    <template v-else>
      <div class="balance-amount">
        <span class="balance-label">Open balance</span>
        <strong>{{ amountLabel }}</strong>
      </div>
      <div class="balance-actions">
        <span class="balance-summary">{{ summary }}</span>
        <template v-if="canSettle">
          <button
            v-if="!confirming"
            class="balance-button balance-button--primary"
            type="button"
            @click="confirming = true"
          >
            Settle
          </button>
          <template v-else>
            <button
              class="balance-button balance-button--primary"
              type="button"
              :disabled="settling"
              @click="settle"
            >
              Confirm ({{ amountLabel }})
            </button>
            <button
              class="balance-button balance-button--secondary"
              type="button"
              :disabled="settling"
              @click="confirming = false"
            >
              Cancel
            </button>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.balance {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-self: flex-start;
  gap: var(--space-4);
  width: 100%;
  max-width: 24rem;
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.balance-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.balance-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
}

.balance-label,
.balance-summary,
.balance-message {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.balance-amount strong {
  font-size: 1.5rem;
  line-height: 1.2;
}

.balance-message {
  margin: 0;
}

.balance-message--error {
  color: var(--color-danger);
}

.balance-button {
  padding: var(--space-2) var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
}

.balance-button--primary {
  background: var(--color-primary);
  color: white;
}

.balance-button--secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
</style>
