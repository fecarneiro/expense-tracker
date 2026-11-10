<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/modules/auth/api/auth.api'
import { saveSession } from '@/shared/auth/auth.session'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const router = useRouter()
const route = useRoute()

const sessionExpired = route.query.reason === 'session-expired'

const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function submit(): Promise<void> {
  loading.value = true
  errorMessage.value = null

  try {
    const response = await login({
      email: email.value.trim(),
      password: password.value,
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
  <main class="grid min-h-dvh place-items-center p-4">
    <Card class="w-full max-w-sm rounded-lg p-8 shadow-none">
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <h1 class="text-xl font-semibold">Expense Tracker</h1>

        <p v-if="sessionExpired" class="text-muted-foreground text-sm">
          Your session has expired. Please log in again.
        </p>

        <div class="flex flex-col gap-2">
          <Label for="login-email">E-mail</Label>
          <Input id="login-email" v-model="email" type="email" autocomplete="email" required />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="login-password">Password</Label>
          <Input
            id="login-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="errorMessage" class="text-destructive text-sm" role="alert">
          {{ errorMessage }}
        </p>

        <Button type="submit" :disabled="loading">
          {{ loading ? 'Loading...' : 'Sign in' }}
        </Button>
      </form>
    </Card>
  </main>
</template>
