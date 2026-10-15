import { afterEach, describe, expect, it, vi } from 'vitest'
import { reloadOnStaleCode } from './reload-on-stale-code'

function setUp() {
  const reload = vi.fn()
  const stored = new Map<string, string>()
  vi.stubGlobal('window', Object.assign(new EventTarget(), { location: { reload } }))
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
  })
  reloadOnStaleCode()

  function failToLoadCode() {
    const event = new Event('vite:preloadError', { cancelable: true })
    window.dispatchEvent(event)
    return event
  }

  return { reload, failToLoadCode }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('reloadOnStaleCode', () => {
  it('reloads once, then lets the error page show if loading fails again right away', () => {
    vi.useFakeTimers({ now: new Date('2026-10-15T10:00:00Z') })
    const { reload, failToLoadCode } = setUp()

    expect(failToLoadCode().defaultPrevented).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(3_000)
    expect(failToLoadCode().defaultPrevented).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('reloads again for a later deploy', () => {
    vi.useFakeTimers({ now: new Date('2026-10-15T10:00:00Z') })
    const { reload, failToLoadCode } = setUp()

    failToLoadCode()
    vi.advanceTimersByTime(60 * 60 * 1000)
    failToLoadCode()

    expect(reload).toHaveBeenCalledTimes(2)
  })
})
