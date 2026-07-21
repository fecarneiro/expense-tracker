import { clearSession, getAccessToken } from '@/modules/auth/auth.session'

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { authenticated = true, ...requestOptions } = options

  const headers = new Headers(requestOptions.headers)

  if (authenticated) {
    const accessToken = getAccessToken()

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  if (requestOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`/api${path}`, {
    ...requestOptions,
    headers,
  })

  if (response.status === 401 && authenticated) {
    clearSession()
    window.location.assign('/login?reason=session-expired')
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
