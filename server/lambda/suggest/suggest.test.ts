import { describe, expect, it } from 'vitest'
import { EMPTY_PLAN_ANSWERS } from '@shared/week-plan/week-plan'
import type { MealItem } from '@server/lambda/data/meals.ts'
import { searchMeals, suggestMeals, SUGGESTIONS_PER_MEAL_TYPE } from './suggest.ts'

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

describe('suggestMeals', () => {
  it('puts the must-have dish first, even with an avoided ingredient, and leaves out the rest', () => {
    const meals = [
      meal('salad', { ingredients: withIngredients('spinach') }),
      meal('fesenjan', { ingredients: withIngredients('walnut') }),
      meal('walnut-cake', { ingredients: withIngredients('walnut') }),
    ]
    const answers = {
      ...EMPTY_PLAN_ANSWERS,
      avoid: ['walnut'],
      expiring: ['spinach'],
      mustHaveMealId: 'fesenjan',
    }

    expect(suggestMeals(meals, answers).Dinner).toEqual(['fesenjan', 'salad'])
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

describe('searchMeals', () => {
  const ids = (result: ReturnType<typeof searchMeals>) => result.meals.map((found) => found.id)

  it('never returns a meal with an ingredient to avoid, even when it is the best match', () => {
    const meals = [
      meal('fesenjan', {
        cuisine: 'persian',
        dishStyles: ['stew'],
        ingredients: withIngredients('walnut', 'pomegranate-molasses', 'chicken-thigh'),
      }),
      meal('salad', { cuisine: 'persian', ingredients: withIngredients('lettuce') }),
    ]
    const wishes = {
      expiring: ['chicken-thigh', 'pomegranate-molasses'],
      cuisines: ['persian'],
      dishStyles: ['stew' as const],
    }

    expect(ids(searchMeals(meals, { ...wishes, avoid: ['walnut', 'almond'] }))).toEqual(['salad'])
  })

  it('returns a dish asked for by name first, whatever filter it breaks, and says what it avoids', () => {
    const meals = [
      meal('menemen', { mealTypes: ['Breakfast'], cuisine: 'turkish', prepMinutes: 20 }),
      meal('fesenjan', {
        cuisine: 'persian',
        prepMinutes: 120,
        ingredients: withIngredients('walnut', 'chicken-thigh'),
      }),
    ]

    const result = searchMeals(meals, {
      mealType: 'Breakfast',
      maxPrepMinutes: 30,
      avoid: ['walnut'],
      cuisines: ['turkish'],
      mustHaveMealId: 'fesenjan',
    }).meals

    expect(result.map((found) => found.id)).toEqual(['fesenjan', 'menemen'])
    expect(result[0].hasAvoided).toEqual(['walnut'])
    expect(result[1]).not.toHaveProperty('hasAvoided')
  })

  it('applies every rule of a real request together', () => {
    const meals = [
      meal('fesenjan', {
        cuisine: 'persian',
        dishStyles: ['stew'],
        prepMinutes: 120,
        ingredients: withIngredients('walnut', 'chicken-thigh'),
      }),
      meal('ghormeh-sabzi', {
        cuisine: 'persian',
        dishStyles: ['stew'],
        prepMinutes: 180,
        ingredients: withIngredients('lamb-stew-meat', 'spinach'),
      }),
      meal('adasi', {
        cuisine: 'persian',
        dishStyles: ['soup'],
        prepMinutes: 40,
        ingredients: withIngredients('red-lentil'),
      }),
      meal('kuku-sabzi', {
        cuisine: 'persian',
        dishStyles: ['egg-dish'],
        prepMinutes: 40,
        ingredients: withIngredients('spinach', 'egg', 'walnut'),
      }),
      meal('menemen', {
        cuisine: 'turkish',
        mealTypes: ['Breakfast'],
        prepMinutes: 20,
        ingredients: withIngredients('egg', 'tomato'),
      }),
      meal('chicken-teriyaki-rice', {
        cuisine: 'asian',
        prepMinutes: 30,
        ingredients: withIngredients('chicken-thigh', 'jasmine-rice'),
      }),
      meal('spinach-soup', {
        cuisine: 'international',
        dishStyles: ['soup'],
        prepMinutes: 30,
        ingredients: withIngredients('spinach'),
      }),
      meal('baghala-ghatogh', {
        cuisine: 'persian',
        dishStyles: ['stew'],
        prepMinutes: 35,
        ingredients: withIngredients('broad-bean', 'egg'),
      }),
      meal('mirza-ghasemi', {
        cuisine: 'persian',
        dishStyles: ['stew'],
        prepMinutes: 35,
        ingredients: withIngredients('aubergine', 'egg'),
      }),
    ]

    const result = searchMeals(meals, {
      mealType: 'Dinner',
      avoid: ['walnut'],
      maxPrepMinutes: 45,
      expiring: ['spinach'],
      cuisines: ['persian'],
      dishStyles: ['soup'],
    })

    // Out: fesenjan and kuku-sabzi (walnut), ghormeh-sabzi (too slow), menemen (breakfast only).
    // Persian: adasi (persian 2 + soup 2 = 4), baghala-ghatogh and mirza-ghasemi (2 each, by id).
    // Then other cuisines fill the rest: spinach-soup (spinach 3 + soup 2) beats teriyaki (0).
    expect(ids(result)).toEqual([
      'adasi',
      'baghala-ghatogh',
      'mirza-ghasemi',
      'spinach-soup',
      'chicken-teriyaki-rice',
    ])
  })

  describe('when the user asks for a cuisine', () => {
    // Asian meals that use the expiring spinach score higher than the Persian ones.
    const persian = (count: number) =>
      Array.from({ length: count }, (_, i) => meal(`persian-${i}`, { cuisine: 'persian' }))
    const asian = (count: number) =>
      Array.from({ length: count }, (_, i) =>
        meal(`asian-${i}`, { cuisine: 'asian', ingredients: withIngredients('spinach') }),
      )
    const wishes = { cuisines: ['persian'], expiring: ['spinach'] }

    it('returns only that cuisine when 10 or more of it fit, even when others score higher', () => {
      const result = searchMeals([...asian(5), ...persian(12)], wishes).meals

      expect(result).toHaveLength(10)
      expect(result.every((found) => found.cuisine === 'persian')).toBe(true)
    })

    it('fills up to 10 meals with other cuisines when too few of that cuisine fit', () => {
      const result = searchMeals([...asian(12), ...persian(2)], wishes).meals

      expect(result.map((found) => found.cuisine)).toEqual([
        'persian',
        'persian',
        ...Array(8).fill('asian'),
      ])
    })
  })

  it('returns short meals with their ingredients and the wanted ones they use', () => {
    const omelette = meal('omelette', {
      dishStyles: ['egg-dish'],
      activeMinutes: 10,
      ingredients: withIngredients('egg', 'tomato'),
    })

    expect(searchMeals([omelette], { expiring: ['tomato', 'spinach'] }).meals).toEqual([
      {
        id: 'omelette',
        name: 'omelette',
        cuisine: 'international',
        prepMinutes: 30,
        activeMinutes: 10,
        dishStyles: ['egg-dish'],
        ingredients: ['egg', 'tomato'],
        usesWanted: ['tomato'],
      },
    ])
  })
})
