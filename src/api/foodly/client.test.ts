import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './api-error'
import { apiFetch } from './client'

const session = vi.hoisted(() => ({ getAccessToken: vi.fn(), refreshAccessToken: vi.fn() }))
vi.mock('@/api/auth/session', () => session)

const fetchMock = vi.fn()

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('VITE_API_URL', 'https://api.test')
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('apiFetch', () => {
  it('sends the access token and returns the JSON body', async () => {
    session.getAccessToken.mockResolvedValue('access-1')
    fetchMock.mockResolvedValue(jsonResponse(200, { userId: 'user-1' }))

    expect(await apiFetch('/me')).toEqual({ userId: 'user-1' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.test/me')
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer access-1')
  })

  it('sends a JSON body with its content type', async () => {
    session.getAccessToken.mockResolvedValue('access-1')
    fetchMock.mockResolvedValue(jsonResponse(200, {}))

    await apiFetch('/plan', { method: 'PUT', body: JSON.stringify({ a: 1 }) })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('PUT')
    expect(new Headers(init.headers).get('content-type')).toBe('application/json')
  })

  it('refreshes the token once and retries when the API answers 401', async () => {
    session.getAccessToken.mockResolvedValue('old-token')
    session.refreshAccessToken.mockResolvedValue('new-token')
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Unauthorized' }))
      .mockResolvedValueOnce(jsonResponse(200, { userId: 'user-1' }))

    expect(await apiFetch('/me')).toEqual({ userId: 'user-1' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(new Headers(fetchMock.mock.calls[1][1].headers).get('authorization')).toBe(
      'Bearer new-token',
    )
  })

  it('does not call the API when nobody is signed in', async () => {
    session.getAccessToken.mockResolvedValue(null)

    await expect(apiFetch('/me')).rejects.toMatchObject({ name: 'ApiError', status: 401 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('stops when the refresh fails, instead of retrying forever', async () => {
    session.getAccessToken.mockResolvedValue('old-token')
    session.refreshAccessToken.mockResolvedValue(null)
    fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Unauthorized' }))

    await expect(apiFetch('/me')).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws an ApiError with the status for other errors', async () => {
    session.getAccessToken.mockResolvedValue('access-1')
    fetchMock.mockResolvedValue(jsonResponse(500, { message: 'Internal Server Error' }))

    const error = await apiFetch('/me').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500, message: 'GET /me failed', code: undefined })
  })

  it('keeps the error code our backend sends', async () => {
    session.getAccessToken.mockResolvedValue('access-1')
    fetchMock.mockResolvedValue(jsonResponse(429, { code: 'daily-limit', message: 'Limit' }))

    await expect(apiFetch('/plan/understand')).rejects.toMatchObject({
      status: 429,
      code: 'daily-limit',
    })
  })

  it('has no code when the error body is not JSON', async () => {
    session.getAccessToken.mockResolvedValue('access-1')
    fetchMock.mockResolvedValue(new Response('Bad gateway', { status: 502 }))

    await expect(apiFetch('/me')).rejects.toMatchObject({ status: 502, code: undefined })
  })
})
