import { type LoginRequest, loginResponseSchema } from '@expense-tracker/contracts'
import { apiRequest } from '@/shared/api/http'

export function login(credentials: LoginRequest) {
  return apiRequest('/auth/login', loginResponseSchema, {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify(credentials),
  })
}
