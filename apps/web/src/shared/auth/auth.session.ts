import { type AuthUser, authUserSchema } from '@expense-tracker/contracts'

const ACCESS_TOKEN_KEY = 'expense-tracker:access-token'
const USER_KEY = 'expense-tracker:user'

// TODO: Temporary implementation.
export function saveSession(accessToken: string, user: AuthUser): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getAuthUser(): AuthUser | null {
  const value = sessionStorage.getItem(USER_KEY)

  if (!value) return null

  try {
    const parsedValue: unknown = JSON.parse(value)
    const result = authUserSchema.safeParse(parsedValue)

    if (!result.success) {
      clearSession()
      return null
    }

    return result.data
  } catch {
    clearSession()
    return null
  }
}

export function hasSession(): boolean {
  const accessToken = getAccessToken()
  const user = getAuthUser()

  return accessToken !== null && user !== null
}

export function clearSession(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
