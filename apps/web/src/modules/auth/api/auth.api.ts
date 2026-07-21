import type { LoginRequest, LoginResponse } from '@expense-tracker/contracts'
import { apiRequest } from '@/api/http'

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest('/auth/login', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify(credentials),
  })
}
