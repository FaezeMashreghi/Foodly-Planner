import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/foodly/api-error'
import { shouldReportError } from './monitoring'

function setOnline(onLine: boolean) {
  vi.stubGlobal('navigator', { onLine })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('shouldReportError', () => {
  it('reports server failures', () => {
    setOnline(true)
    expect(shouldReportError(new ApiError(500, 'POST /plan/understand failed'))).toBe(true)
    expect(shouldReportError(new ApiError(503, 'GET /meals failed'))).toBe(true)
  })

  it('does not report answers the UI already handles', () => {
    setOnline(true)
    expect(shouldReportError(new ApiError(401, 'Not signed in'))).toBe(false)
    expect(shouldReportError(new ApiError(429, 'failed', 'daily-limit'))).toBe(false)
    expect(shouldReportError(new ApiError(400, 'failed'))).toBe(false)
  })

  it('reports other errors (bugs), but not while the user is offline', () => {
    const networkError = new TypeError('Failed to fetch')

    setOnline(true)
    expect(shouldReportError(networkError)).toBe(true)

    setOnline(false)
    expect(shouldReportError(networkError)).toBe(false)
  })
})
