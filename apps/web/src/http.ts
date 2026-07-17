const API_BASE_PATH = '/api'

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_PATH}${path}`, options)

  // restante do tratamento...
  return response.json() as Promise<T>
}
