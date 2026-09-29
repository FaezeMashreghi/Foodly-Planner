import { describe, expect, it } from 'vitest'
import { formatLongDate } from './format-date'

describe('formatLongDate', () => {
  it('writes the weekday, day and month', () => {
    expect(formatLongDate('2026-09-29')).toBe('Tuesday 29 September')
    expect(formatLongDate('2027-01-01')).toBe('Friday 1 January')
  })
})
