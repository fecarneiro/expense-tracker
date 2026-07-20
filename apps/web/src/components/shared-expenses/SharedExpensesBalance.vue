<script setup lang="ts">
import type { PendingBalance } from '@expense-tracker/contracts'
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '@/api/http'
import { getAuthUser } from '@/auth/auth.session'
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
  formatMoney(Math.abs(totalAmountCents.value), user?.currency ?? 'USD', user?.locale ?? 'en-US'),
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
</script>

<template>
  <div class="balance">
    <p v-if="loading">Loading balance...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <template v-else>
      <div>
        <span>Open balance</span>
        <strong>{{ amountLabel }}</strong>
      </div>
      <div>
        <span>{{ summary }}</span>
        <template v-if="canSettle">
          <button v-if="!confirming" type="button" @click="confirming = true">Settle</button>
          <template v-else>
            <button type="button" :disabled="settling" @click="settle">
              Confirm ({{ amountLabel }})
            </button>
            <button type="button" :disabled="settling" @click="confirming = false">Cancel</button>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>
