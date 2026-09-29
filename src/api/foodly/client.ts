import { getAccessToken, refreshAccessToken } from '@/api/auth/session'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw new ApiError(401, 'Not signed in')

  let response = await send(path, init, token)

  // The token can be rejected before its expiry time (e.g. revoked): refresh once and retry.
  if (response.status === 401) {
    const freshToken = await refreshAccessToken()
    if (!freshToken) throw new ApiError(401, 'Not signed in')
    response = await send(path, init, freshToken)
  }

  if (!response.ok) throw new ApiError(response.status, `${init.method ?? 'GET'} ${path} failed`)

  return (await response.json()) as T
}

function send(path: string, init: RequestInit, token: string) {
  const headers = new Headers(init.headers)
  headers.set('authorization', `Bearer ${token}`)
  if (init.body) headers.set('content-type', 'application/json')

  return fetch(`${import.meta.env.VITE_API_URL}${path}`, { ...init, headers })
}
