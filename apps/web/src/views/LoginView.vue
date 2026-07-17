<script setup lang="ts">
import type { LoginRequest, LoginResponse } from '@expense-tracker/contracts'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiRequest } from '@/api/http'
import { saveSession } from '@/auth/auth.session'

const router = useRouter()

const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function submit(): Promise<void> {
  loading.value = true
  errorMessage.value = null

  const credentials: LoginRequest = {
    email: email.value,
    password: password.value,
  }

  try {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify(credentials),
    })

    saveSession(response.access_token, response.user)

    await router.replace('/')
  } catch {
    errorMessage.value = 'Unable to login.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <form class="login-form" @submit.prevent="submit">
      <h1>Expense Tracker</h1>
      <label>
        E-mail

        <input v-model.trim="email" type="email" autocomplete="email" required>
      </label>

      <label>
        Password

        <input v-model="password" type="password" autocomplete="current-password" required>
      </label>

      <p v-if="errorMessage" role="alert">
        {{ errorMessage }}
      </p>

      <button type="submit" :disabled="loading">
        {{ loading? 'Loading...' : 'Sign in' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
}

.login-form {
  display: flex;
  flex-direction: column;
}
</style>
