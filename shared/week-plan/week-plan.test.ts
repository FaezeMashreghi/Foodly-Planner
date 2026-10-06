import { describe, expect, it } from 'vitest'
import {
  dayOf,
  daysFrom,
  isIsoDate,
  isSlotId,
  nextSevenDays,
  setSlotMeal,
  toIsoDate,
  weekStartOf,
} from './week-plan'

describe('setSlotMeal', () => {
  it('puts a meal in an empty slot', () => {
    expect(setSlotMeal({}, 'Monday Dinner', 'ghormeh-sabzi')).toEqual({
      'Monday Dinner': 'ghormeh-sabzi',
    })
  })

  it('replaces the meal already in the slot', () => {
    const slots = { 'Monday Dinner': 'ghormeh-sabzi' }
    expect(setSlotMeal(slots, 'Monday Dinner', 'lahmacun')).toEqual({ 'Monday Dinner': 'lahmacun' })
  })

  it('leaves other slots alone', () => {
    const slots = { 'Monday Lunch': 'menemen' }
    expect(setSlotMeal(slots, 'Monday Dinner', 'lahmacun')).toEqual({
      'Monday Lunch': 'menemen',
      'Monday Dinner': 'lahmacun',
    })
  })

  it('returns the same object when that meal is already in the slot', () => {
    const slots = { 'Monday Dinner': 'ghormeh-sabzi' }
    expect(setSlotMeal(slots, 'Monday Dinner', 'ghormeh-sabzi')).toBe(slots)
  })

  it('does not change the original slots', () => {
    const slots = {}
    setSlotMeal(slots, 'Monday Dinner', 'ghormeh-sabzi')
    expect(slots).toEqual({})
  })
})

describe('isSlotId', () => {
  it('accepts a day and meal', () => {
    expect(isSlotId('Friday Lunch')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isSlotId('Funday Lunch')).toBe(false)
    expect(isSlotId(42)).toBe(false)
  })
})

describe('dayOf', () => {
  it('returns the day of the week, starting on Monday', () => {
    expect(dayOf(new Date(2026, 8, 21))).toBe('Monday')
    expect(dayOf(new Date(2026, 8, 27))).toBe('Sunday')
  })
})

describe('weekStartOf', () => {
  it('returns the Monday of the week', () => {
    expect(weekStartOf(new Date(2026, 8, 28))).toBe('2026-09-28')
    expect(weekStartOf(new Date(2026, 9, 1))).toBe('2026-09-28')
    expect(weekStartOf(new Date(2026, 9, 4, 23, 30))).toBe('2026-09-28')
  })

  it('crosses month and year boundaries', () => {
    expect(weekStartOf(new Date(2026, 9, 2))).toBe('2026-09-28')
    expect(weekStartOf(new Date(2027, 0, 1))).toBe('2026-12-28')
  })
})

describe('toIsoDate', () => {
  it('pads the month and day with a zero', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('uses the local date, not UTC', () => {
    expect(toIsoDate(new Date(2026, 8, 29, 23, 59))).toBe('2026-09-29')
  })
})

describe('nextSevenDays', () => {
  it('returns today and the 6 days after it, across a month boundary', () => {
    expect(nextSevenDays(new Date(2026, 8, 29, 18, 0))).toEqual([
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
    ])
  })

  it('crosses a year boundary', () => {
    expect(nextSevenDays(new Date(2026, 11, 30)).at(-1)).toBe('2027-01-05')
  })
})

describe('isIsoDate', () => {
  it('accepts a real date', () => {
    expect(isIsoDate('2026-09-29')).toBe(true)
  })

  it('rejects other values and impossible dates', () => {
    expect(isIsoDate('2026-9-29')).toBe(false)
    expect(isIsoDate('2026-13-01')).toBe(false)
    expect(isIsoDate('2026-02-30')).toBe(false)
    expect(isIsoDate(20260929)).toBe(false)
    expect(isIsoDate(undefined)).toBe(false)
  })
})

describe('daysFrom', () => {
  it('lists the 7 days from the start day', () => {
    expect(daysFrom('2026-10-01')).toEqual([
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
    ])
  })

  it('starts on Monday for a plan that starts on a Monday', () => {
    expect(daysFrom('2026-09-28')[0]).toBe('Monday')
  })
})
