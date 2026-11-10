import { clearSession, getAccessToken } from '@/shared/auth/auth.session'
import { ApiError } from './errors'

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean
}

type ResponseSchema<T> = {
  parse: (data: unknown) => T
}

async function send(path: string, options: ApiRequestOptions): Promise<Response> {
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
    throw new ApiError(401, 'Unauthorized')
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(
      response.status,
      body?.message ?? `Request failed with status ${response.status}`,
    )
  }

  return response
}

export async function apiRequest<T>(
  path: string,
  schema: ResponseSchema<T>,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await send(path, options)

  return schema.parse(await response.json())
}

export async function apiCommand(path: string, options: ApiRequestOptions = {}): Promise<void> {
  await send(path, options)
}
