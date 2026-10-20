import { describe, expect, it } from 'vitest'
import { EMPTY_PLAN_ANSWERS } from '@shared/week-plan/week-plan'
import { labelsFor, withNames, type Catalog, type IngredientItem } from './catalog.ts'
import type { MealItem } from './meals.ts'

const ingredients: IngredientItem[] = [
  {
    type: 'ingredient',
    id: 'dried-lime',
    name: 'Dried lime',
    category: 'herb-spice',
    unit: 'piece',
  },
  {
    type: 'ingredient',
    id: 'beef-stew-meat',
    name: 'Beef stew meat',
    category: 'meat',
    unit: 'g',
    emoji: '🥩',
  },
]
const cuisines: Catalog['cuisines'] = [{ type: 'cuisine', id: 'persian', name: 'Persian' }]
const catalog: Catalog = {
  ingredients,
  cuisines,
  ingredientById: new Map(ingredients.map((item) => [item.id, item])),
  cuisineById: new Map(cuisines.map((item) => [item.id, item])),
}

const meal: MealItem = {
  id: 'ghormeh-sabzi',
  name: 'Ghormeh sabzi',
  emoji: '🌿',
  mealTypes: ['Dinner'],
  cuisine: 'persian',
  difficulty: 'medium',
  prepMinutes: 180,
  servings: 2,
  ingredients: [
    { ingredientId: 'beef-stew-meat', amount: 300, unit: 'g' },
    { ingredientId: 'dried-lime', amount: 3, unit: 'piece' },
  ],
}

describe('withNames', () => {
  it("adds the cuisine's name and each ingredient's name and emoji", () => {
    expect(withNames(meal, catalog)).toMatchObject({
      cuisineName: 'Persian',
      ingredients: [
        {
          ingredientId: 'beef-stew-meat',
          amount: 300,
          unit: 'g',
          name: 'Beef stew meat',
          emoji: '🥩',
        },
        { ingredientId: 'dried-lime', amount: 3, unit: 'piece', name: 'Dried lime' },
      ],
    })
  })

  it('shows an id that is not in the catalogue as it is', () => {
    const unknown: MealItem = {
      ...meal,
      cuisine: 'mexican',
      ingredients: [{ ingredientId: 'dragon-fruit', amount: 1, unit: 'piece' }],
    }

    expect(withNames(unknown, catalog)).toMatchObject({
      cuisineName: 'mexican',
      ingredients: [{ name: 'dragon-fruit' }],
    })
  })
})

describe('labelsFor', () => {
  const answers = {
    ...EMPTY_PLAN_ANSWERS,
    expiring: ['dried-lime'],
    avoid: ['beef-stew-meat', 'dragon-fruit'],
    cuisines: ['persian'],
    mustHaveMealId: 'ghormeh-sabzi',
  }

  it('names every ingredient, cuisine and the must-have dish in the answers', () => {
    expect(labelsFor(answers, catalog, [meal])).toEqual({
      ingredients: {
        'dried-lime': { name: 'Dried lime' },
        'beef-stew-meat': { name: 'Beef stew meat', emoji: '🥩' },
      },
      cuisines: { persian: 'Persian' },
      meals: { 'ghormeh-sabzi': 'Ghormeh sabzi' },
    })
  })

  it('has no dish name when there is no must-have dish', () => {
    expect(labelsFor({ ...answers, mustHaveMealId: null }, catalog, [meal]).meals).toEqual({})
  })
})
