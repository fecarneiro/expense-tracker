<script setup lang="ts">
import type { SharedExpenseReportResponse } from '@expense-tracker/contracts'
import { createColumnHelper } from '@tanstack/vue-table'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiRequest } from '@/api/http'

const router = useRouter()

const data = ref<SharedExpenseReportResponse | null>(null)

const loading = ref(true)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  errorMessage.value = null
  try {
    data.value = await apiRequest<SharedExpenseReportResponse>('/shared-expenses')
  } catch {
    errorMessage.value = 'Unable to load shared expenses.'
  } finally {
    loading.value = false
  }
})

const columHelper = createColumnHelper<SharedExpenseReportResponse>
</script>

<template>
  <main class="login-page">
    <p v-if="errorMessage">
      {{ errorMessage }}
    </p>
    <!-- TODO: implement case for data.value = [] -->
  </main>
</template>
