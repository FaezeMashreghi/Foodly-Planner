import { getAccessToken, refreshAccessToken } from '@/api/auth/session'

export class ApiError extends Error {
  readonly status: number
  /** Set by our backend when the UI needs to tell one error from another, e.g. "daily-limit". */
  readonly code: string | undefined

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
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

  if (!response.ok) {
    const message = `${init.method ?? 'GET'} ${path} failed`
    throw new ApiError(response.status, message, await readErrorCode(response))
  }

  return (await response.json()) as T
}

async function readErrorCode(response: Response) {
  try {
    const body = (await response.json()) as { code?: unknown }
    return typeof body.code === 'string' ? body.code : undefined
  } catch {
    return undefined
  }
}

function send(path: string, init: RequestInit, token: string) {
  const headers = new Headers(init.headers)
  headers.set('authorization', `Bearer ${token}`)
  if (init.body) headers.set('content-type', 'application/json')

  return fetch(`${import.meta.env.VITE_API_URL}${path}`, { ...init, headers })
}
