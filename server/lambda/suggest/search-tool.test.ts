import { describe, expect, it } from 'vitest'
import { cleanSearchInput, type KnownIds } from './search-tool.ts'
import type { MealItem } from '@server/lambda/data/meals.ts'
import { runSearchMeals } from './search-tool.ts'

function meal(id: string, overrides: Partial<MealItem> = {}): MealItem {
  return {
    id,
    name: id,
    emoji: '🍽️',
    mealTypes: ['Dinner'],
    cuisine: 'international',
    difficulty: 'medium',
    prepMinutes: 30,
    servings: 2,
    ingredients: [],
    ...overrides,
  }
}

const withIngredients = (...ids: string[]): MealItem['ingredients'] =>
  ids.map((ingredientId) => ({ ingredientId, amount: 1, unit: 'piece' }))

const known: KnownIds = {
  ingredientIds: new Set(['walnut', 'almond', 'spinach', 'chicken-thigh']),
  cuisineIds: new Set(['persian', 'turkish']),
  mealIds: new Set(['ghormeh-sabzi', 'adasi']),
}

describe('cleanSearchInput', () => {
  it('keeps a valid request as it is', () => {
    const input = {
      avoid: ['walnut'],
      expiring: ['spinach'],
      wantMore: ['chicken-thigh'],
      cuisines: ['persian'],
      dishStyles: ['stew'],
      mealType: 'Dinner',
      maxPrepMinutes: 30,
      easyOnly: true,
      mustHaveMealId: 'adasi',
    }

    expect(cleanSearchInput(input, known)).toEqual(input)
  })

  it('still avoids an ingredient sent as a single string, so an allergy is never lost', () => {
    expect(cleanSearchInput({ avoid: 'walnut' }, known).avoid).toEqual(['walnut'])
  })

  it('still avoids every ingredient sent as one comma-separated string', () => {
    expect(cleanSearchInput({ avoid: 'walnut, almond' }, known).avoid).toEqual(['walnut', 'almond'])
  })

  it('keeps known ids written loosely, and drops ids the catalogue does not have', () => {
    expect(
      cleanSearchInput({ avoid: [' Walnut ', 'pine-nut', 42, 'almond'] }, known).avoid,
    ).toEqual(['walnut', 'almond'])
  })

  it('drops values that are not in the lists', () => {
    const cleaned = cleanSearchInput(
      {
        cuisines: ['italian', 'turkish'],
        dishStyles: ['bowl', 'soup'],
        mealType: 'Brunch',
        mustHaveMealId: 'lasagne',
      },
      known,
    )

    expect(cleaned).toEqual({ cuisines: ['turkish'], dishStyles: ['soup'] })
  })

  it('keeps a meal type written in any case', () => {
    expect(cleanSearchInput({ mealType: ' dinner' }, known).mealType).toBe('Dinner')
  })

  it('keeps a time limit sent as a number or as text, but only a sensible one', () => {
    expect(cleanSearchInput({ maxPrepMinutes: 45 }, known).maxPrepMinutes).toBe(45)
    expect(cleanSearchInput({ maxPrepMinutes: '30' }, known).maxPrepMinutes).toBe(30)
    expect(cleanSearchInput({ maxPrepMinutes: '30 minutes' }, known).maxPrepMinutes).toBe(30)
    expect(cleanSearchInput({ maxPrepMinutes: 'quick' }, known).maxPrepMinutes).toBeUndefined()
    expect(cleanSearchInput({ maxPrepMinutes: -5 }, known).maxPrepMinutes).toBeUndefined()
  })

  it('keeps easyOnly only when the model asks for easy meals', () => {
    expect(cleanSearchInput({ easyOnly: 'true' }, known).easyOnly).toBe(true)
    expect(cleanSearchInput({ easyOnly: false }, known)).toEqual({})
  })

  it('returns an empty request for input that is not an object', () => {
    expect(cleanSearchInput('walnut', known)).toEqual({})
    expect(cleanSearchInput(null, known)).toEqual({})
  })
})
describe('runSearchMeals', () => {
  it('never returns an allergen meal when the model sends allergies as one string', () => {
    const meals = [
      meal('fesenjan', {
        cuisine: 'persian',
        ingredients: withIngredients('walnut', 'chicken-thigh'),
      }),
      meal('adasi', { cuisine: 'persian', ingredients: withIngredients('red-lentil') }),
    ]
    const modelInput = { avoid: 'walnut, almond', cuisines: ['persian'] }

    const result = runSearchMeals(modelInput, meals, known)

    expect(result.meals.map((found) => found.id)).toEqual(['adasi'])
  })

  it('ranks easy meals first when the user wants to keep it simple', () => {
    const meals = [
      meal('ghormeh-sabzi', { difficulty: 'hard' }),
      meal('adasi', { difficulty: 'easy' }),
    ]

    const result = runSearchMeals({ easyOnly: true }, meals, known)

    expect(result.meals.map((found) => found.id)).toEqual(['adasi', 'ghormeh-sabzi'])
  })
})
