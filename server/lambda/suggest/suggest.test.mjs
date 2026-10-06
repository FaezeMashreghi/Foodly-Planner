import { describe, expect, it } from 'vitest'
import { NO_ANSWERS, scoreMeal, suggestMeals, SUGGESTIONS_PER_MEAL_TYPE } from './suggest.mjs'

function meal(id, overrides = {}) {
  return {
    id,
    mealTypes: ['Dinner'],
    cuisine: 'international',
    difficulty: 'medium',
    prepMinutes: 30,
    ingredients: [],
    ...overrides,
  }
}

const withIngredients = (...ids) =>
  ids.map((ingredientId) => ({ ingredientId, amount: 1, unit: 'piece' }))

describe('scoreMeal', () => {
  it('scores 0 when nothing was answered', () => {
    expect(scoreMeal(meal('a'), NO_ANSWERS)).toBe(0)
  })

  it('counts each expiring ingredient the meal uses', () => {
    const spinachTomato = meal('a', { ingredients: withIngredients('spinach', 'tomato', 'onion') })
    expect(scoreMeal(spinachTomato, { ...NO_ANSWERS, expiring: ['spinach', 'tomato'] })).toBe(6)
  })

  it('adds points for a matching cuisine', () => {
    expect(
      scoreMeal(meal('a', { cuisine: 'persian' }), { ...NO_ANSWERS, cuisines: ['persian'] }),
    ).toBe(2)
  })

  it('caps the points for "more of" ingredients', () => {
    const veg = meal('a', {
      ingredients: withIngredients('broccoli', 'spinach', 'carrot', 'courgette'),
    })
    const answers = { ...NO_ANSWERS, wantMore: ['broccoli', 'spinach', 'carrot', 'courgette'] }
    expect(scoreMeal(veg, answers)).toBe(3)
  })

  it('prefers easy meals when the user wants easy', () => {
    const answers = { ...NO_ANSWERS, easyOnly: true }
    expect(scoreMeal(meal('a', { difficulty: 'easy' }), answers)).toBe(1)
    expect(scoreMeal(meal('b', { difficulty: 'hard' }), answers)).toBe(-1)
  })

  it('pushes down meals over the time limit', () => {
    const answers = { ...NO_ANSWERS, maxPrepMinutes: 30 }
    expect(scoreMeal(meal('a', { prepMinutes: 30 }), answers)).toBe(0)
    expect(scoreMeal(meal('b', { prepMinutes: 90 }), answers)).toBe(-3)
  })
})

describe('suggestMeals', () => {
  it('puts the must-have dish first', () => {
    const meals = [
      meal('ghormeh-sabzi', { prepMinutes: 180 }),
      meal('salad', { cuisine: 'persian', ingredients: withIngredients('spinach') }),
    ]
    const answers = {
      ...NO_ANSWERS,
      expiring: ['spinach'],
      cuisines: ['persian'],
      maxPrepMinutes: 30,
      mustHaveMealId: 'ghormeh-sabzi',
    }

    expect(suggestMeals(meals, answers).Dinner).toEqual(['ghormeh-sabzi', 'salad'])
  })

  it('leaves out meals with an ingredient to avoid, even the must-have dish', () => {
    const meals = [
      meal('walnut-salad', { ingredients: withIngredients('walnut') }),
      meal('rice', { ingredients: withIngredients('basmati-rice') }),
    ]
    const answers = { ...NO_ANSWERS, avoid: ['walnut'], mustHaveMealId: 'walnut-salad' }

    expect(suggestMeals(meals, answers).Dinner).toEqual(['rice'])
  })

  it('sorts by score, then by id', () => {
    const meals = [meal('c'), meal('b'), meal('a', { cuisine: 'turkish' })]
    const answers = { ...NO_ANSWERS, cuisines: ['turkish'] }

    expect(suggestMeals(meals, answers).Dinner).toEqual(['a', 'b', 'c'])
  })

  it('lists each meal type separately, with at most 10 each', () => {
    const meals = [
      meal('omelette', { mealTypes: ['Breakfast', 'Lunch'] }),
      ...Array.from({ length: 12 }, (_, i) => meal(`dinner-${String(i).padStart(2, '0')}`)),
    ]

    const suggestions = suggestMeals(meals)

    expect(suggestions.Breakfast).toEqual(['omelette'])
    expect(suggestions.Lunch).toEqual(['omelette'])
    expect(suggestions.Dinner).toHaveLength(SUGGESTIONS_PER_MEAL_TYPE)
  })
})
