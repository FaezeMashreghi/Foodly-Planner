import * as cognito from './cognito'
import type { AuthTokens } from './cognito'

const STORAGE_KEY = 'foodly.auth'
const REFRESH_MARGIN_MS = 60_000

export type AuthUser = {
  id: string
  email: string
}

let tokens: AuthTokens | null = readTokens()
let user: AuthUser | null = tokens ? userFromIdToken(tokens.idToken) : null
let refreshing: Promise<AuthTokens | null> | null = null
const listeners = new Set<() => void>()

export function getUser(): AuthUser | null {
  return user
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  setTokens(await cognito.signIn(email.trim(), password))
  return user!
}

export async function signOut(): Promise<void> {
  const refreshToken = tokens?.refreshToken
  setTokens(null)
  if (refreshToken) {
    await cognito.signOut(refreshToken).catch(() => {})
  }
}

export async function getAccessToken(): Promise<string | null> {
  if (!tokens) return null
  if (tokens.expiresAt - Date.now() > REFRESH_MARGIN_MS) return tokens.accessToken

  // One refresh at a time; concurrent callers share it.
  refreshing ??= refresh().finally(() => {
    refreshing = null
  })
  return (await refreshing)?.accessToken ?? null
}

async function refresh(): Promise<AuthTokens | null> {
  const refreshToken = tokens?.refreshToken
  if (!refreshToken) return null
  try {
    const fresh = await cognito.refreshTokens(refreshToken)
    setTokens(fresh)
    return fresh
  } catch {
    setTokens(null)
    return null
  }
}

function setTokens(next: AuthTokens | null) {
  const previousUserId = user?.id
  tokens = next
  user = next ? userFromIdToken(next.idToken) : null
  writeTokens(next)
  if (user?.id !== previousUserId) listeners.forEach((listener) => listener())
}

function readTokens(): AuthTokens | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as AuthTokens) : null
  } catch {
    return null
  }
}

function writeTokens(next: AuthTokens | null) {
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable (some private windows).
  }
}

// Not verified: for display only. The backend verifies the access token.
function userFromIdToken(idToken: string): AuthUser | null {
  try {
    const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as { sub: string; email: string }
    return { id: claims.sub, email: claims.email }
  } catch {
    return null
  }
}
