<script setup lang="ts">
import {
  type LoginRequest,
  type LoginResponse,
  loginRequestSchema,
} from '@expense-tracker/contracts'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '@/api/http'
import { saveSession } from '@/shared/auth/auth.session'

const router = useRouter()
const route = useRoute()

const sessionExpired = route.query.reason === 'session-expired'
//
const initialValues: LoginRequest = {
  email: '',
  password: '',
}

const resolver = zodResolver(loginRequestSchema)
//

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
    <h1>Expense Tracker</h1>

    <p v-if="sessionExpired">Your session has expired. Please log in again.</p>

    <Form
      v-slot="$form"
      class="login-form"
      :initial-values="initialValues"
      :resolver="resolver"
      @submit="onSubmit"
    >
      <div class="form-field">
        <InputText name="email" type="email" placeholder="E-mail" fluid />
        <InputText name="password" type="password" placeholder="Password" fluid />
      </div>
    </Form>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  padding: var(--space-4);
  place-items: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  width: 100%;
  max-width: 24rem;
  padding: var(--space-8);

  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.login-form h1,
.login-form p {
  margin: 0;
}

.login-form label {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-weight: 600;
}

.login-form input {
  width: 100%;
  padding: var(--space-3);

  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
}

.login-form input:focus {
  border-color: var(--color-primary);
}

.login-form button {
  padding: var(--space-3) var(--space-4);

  background: var(--color-primary);
  border: 0;
  border-radius: var(--radius-sm);
  color: white;
  font-weight: 600;
}

.login-form [role="alert"] {
  color: var(--color-danger);
}
</style>
