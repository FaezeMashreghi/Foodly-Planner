import { describe, expect, it } from 'vitest'
import { weekMeals } from './week-meals'

describe('weekMeals', () => {
  it('lists days from the start day and meals from breakfast to dinner, skipping empty days', () => {
    const plan = {
      // A Friday: the week runs Friday to Thursday.
      weekStart: '2026-10-02',
      // Mixed up on purpose, so the test fails if the sorting breaks.
      slots: {
        'Sunday Lunch': 'balik-ekmek',
        'Friday Lunch': 'ghormeh-sabzi',
        'Saturday Lunch': 'menemen',
        'Sunday Breakfast': 'khagineh-khorma',
        'Friday Breakfast': 'nan-panir-gerdoo',
        'Monday Dinner': 'menemen',
      },
    }

    expect(weekMeals(plan)).toEqual([
      {
        day: 'Friday',
        meals: [
          { mealType: 'Breakfast', mealId: 'nan-panir-gerdoo' },
          { mealType: 'Lunch', mealId: 'ghormeh-sabzi' },
        ],
      },
      { day: 'Saturday', meals: [{ mealType: 'Lunch', mealId: 'menemen' }] },
      {
        day: 'Sunday',
        meals: [
          { mealType: 'Breakfast', mealId: 'khagineh-khorma' },
          { mealType: 'Lunch', mealId: 'balik-ekmek' },
        ],
      },
      { day: 'Monday', meals: [{ mealType: 'Dinner', mealId: 'menemen' }] },
    ])
  })

  it('returns no days when no meals are placed', () => {
    expect(weekMeals({ weekStart: '2026-10-02', slots: {} })).toEqual([])
  })
})
