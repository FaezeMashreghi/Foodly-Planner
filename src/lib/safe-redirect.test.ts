import { describe, expect, it } from 'vitest'
import { safeRedirect } from './safe-redirect'

describe('safeRedirect', () => {
  it.each(['/', '/preferences', '/preferences?tab=diet'])('keeps the same-site path %j', (path) => {
    expect(safeRedirect(path)).toBe(path)
  })

  it.each(['https://evil.com', '//evil.com', '/\\evil.com', 'preferences', '', 42, undefined])(
    'rejects %j',
    (value) => {
      expect(safeRedirect(value)).toBeUndefined()
    },
  )
})
