<script setup lang="ts">
import { type LoginRequest, loginRequestSchema } from '@expense-tracker/contracts'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputPassword from 'primevue/inputpassword'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useRoute, useRouter } from 'vue-router'
import { useLoginMutation } from '@/modules/auth/api/auth.queries'
import { saveSession } from '@/modules/auth/auth.session'

const router = useRouter()
const route = useRoute()

const sessionExpired = route.query.reason === 'session-expired'
const initialValues: LoginRequest = {
  email: '',
  password: '',
}

const resolver = zodResolver(loginRequestSchema)

const loginMutation = useLoginMutation()

async function submit(event: FormSubmitEvent): Promise<void> {
  if (!event.valid) return

  try {
    const response = await loginMutation.mutateAsync(event.values as LoginRequest)

    saveSession(response.access_token, response.user)

    await router.replace('/')
  } catch {}
}
</script>

<template>
  <main class="login-page">
    <Card class="login-card">
      <template #title>Expense Tracker</template>
      <template #content>
        <p v-if="sessionExpired">Your session has expired. Please log in again.</p>

        <Form
          v-slot="$form"
          class="login-form"
          :initial-values="initialValues"
          :resolver="resolver"
          :validate-on-value-update="false"
          @submit="submit"
        >
          <div class="form-field">
            <InputText name="email" type="email" placeholder="E-mail" fluid />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
              <p v-for="(error, index) of $form.email.errors" :key="index">
                {{ error.message }}
              </p>
            </Message>

            <InputPassword name="password" type="password" placeholder="Password" fluid />
            <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
              <p v-for="(error, index) of $form.password.errors" :key="index">
                {{ error.message }}
              </p>
            </Message>
          </div>

          <Message v-if="loginMutation.isError.value" severity="error" role="alert">
            Unable to login.
          </Message>

          <Button type="submit" severity="secondary" :loading="loginMutation.isPending.value"
            >Submit</Button
          >
        </Form>
      </template>
    </Card>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  padding: 1rem;
  place-items: center;
}

.login-card {
  width: 100%;
  max-width: 24rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 24rem;
}

.form-field {
  display: grid;
  gap: 0.375rem;
}
</style>
