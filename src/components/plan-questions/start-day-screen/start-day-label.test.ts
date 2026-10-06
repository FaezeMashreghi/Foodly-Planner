import { describe, expect, it } from 'vitest'
import { describeStartDay } from './start-day-label'

describe('describeStartDay', () => {
  it('names the first two days "Today" and "Tomorrow"', () => {
    expect(describeStartDay('2026-09-29', 0)).toBe('Today, Tuesday 29 September')
    expect(describeStartDay('2026-09-30', 1)).toBe('Tomorrow, Wednesday 30 September')
  })

  it('shows only the date for the other days', () => {
    expect(describeStartDay('2026-10-01', 2)).toBe('Thursday 1 October')
  })
})
