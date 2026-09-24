// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthTokens } from './cognito'

const cognito = vi.hoisted(() => ({ signIn: vi.fn(), signOut: vi.fn(), refreshTokens: vi.fn() }))
vi.mock('./cognito', () => cognito)

const STORAGE_KEY = 'foodly.auth'
const HOUR = 60 * 60 * 1000

function fakeIdToken(sub: string, email: string) {
  const payload = btoa(JSON.stringify({ sub, email }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `header.${payload}.signature`
}

function fakeTokens(expiresInMs: number, overrides: Partial<AuthTokens> = {}): AuthTokens {
  return {
    accessToken: 'access-1',
    idToken: fakeIdToken('user-1', 'faeze@example.com'),
    refreshToken: 'refresh-1',
    expiresAt: Date.now() + expiresInMs,
    ...overrides,
  }
}

// session.ts reads localStorage when it loads, so each test loads a fresh copy.
async function loadSession(stored?: AuthTokens) {
  localStorage.clear()
  if (stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  vi.resetModules()
  return import('./session')
}

function storedTokens(): AuthTokens | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signIn', () => {
  it('saves the tokens and returns the user', async () => {
    cognito.signIn.mockResolvedValue(fakeTokens(HOUR))
    const session = await loadSession()

    const user = await session.signIn(' faeze@example.com ', 'Secret1!')

    expect(cognito.signIn).toHaveBeenCalledWith('faeze@example.com', 'Secret1!')
    expect(user).toEqual({ id: 'user-1', email: 'faeze@example.com' })
    expect(session.getUser()).toEqual(user)
    expect(storedTokens()?.accessToken).toBe('access-1')
  })

  it('keeps the user signed in after a reload', async () => {
    const session = await loadSession(fakeTokens(HOUR))
    expect(session.getUser()).toEqual({ id: 'user-1', email: 'faeze@example.com' })
  })
})

describe('getAccessToken', () => {
  it('returns a fresh token without calling Cognito', async () => {
    const session = await loadSession(fakeTokens(HOUR))

    expect(await session.getAccessToken()).toBe('access-1')
    expect(cognito.refreshTokens).not.toHaveBeenCalled()
  })

  it('refreshes a token that is about to expire, without signing the user out and in', async () => {
    cognito.refreshTokens.mockResolvedValue(fakeTokens(HOUR, { accessToken: 'access-2' }))
    const session = await loadSession(fakeTokens(30_000))
    const listener = vi.fn()
    session.subscribe(listener)

    expect(await session.getAccessToken()).toBe('access-2')
    expect(cognito.refreshTokens).toHaveBeenCalledWith('refresh-1')
    expect(storedTokens()?.accessToken).toBe('access-2')
    expect(listener).not.toHaveBeenCalled()
  })

  it('sends only one refresh when several calls need it at once', async () => {
    cognito.refreshTokens.mockResolvedValue(fakeTokens(HOUR, { accessToken: 'access-2' }))
    const session = await loadSession(fakeTokens(0))

    const results = await Promise.all([
      session.getAccessToken(),
      session.getAccessToken(),
      session.getAccessToken(),
    ])

    expect(results).toEqual(['access-2', 'access-2', 'access-2'])
    expect(cognito.refreshTokens).toHaveBeenCalledTimes(1)
  })

  it('signs out when the refresh fails', async () => {
    cognito.refreshTokens.mockRejectedValue(new Error('NotAuthorizedException'))
    const session = await loadSession(fakeTokens(0))
    const listener = vi.fn()
    session.subscribe(listener)

    expect(await session.getAccessToken()).toBeNull()
    expect(session.getUser()).toBeNull()
    expect(storedTokens()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('returns null when nobody is signed in', async () => {
    const session = await loadSession()
    expect(await session.getAccessToken()).toBeNull()
  })
})

describe('signOut', () => {
  it('clears the session even if revoking the token fails', async () => {
    cognito.signOut.mockRejectedValue(new Error('Network error'))
    const session = await loadSession(fakeTokens(HOUR))

    await session.signOut()

    expect(cognito.signOut).toHaveBeenCalledWith('refresh-1')
    expect(session.getUser()).toBeNull()
    expect(storedTokens()).toBeNull()
  })
})
