import { describe, expect, it } from 'vitest'
import { withNames } from './catalog.mjs'

const catalog = {
  ingredientById: new Map([
    ['dried-lime', { id: 'dried-lime', name: 'Dried lime' }],
    ['beef-stew-meat', { id: 'beef-stew-meat', name: 'Beef stew meat', emoji: '🥩' }],
  ]),
  cuisineById: new Map([['persian', { id: 'persian', name: 'Persian' }]]),
}

const meal = {
  id: 'ghormeh-sabzi',
  cuisine: 'persian',
  ingredients: [
    { ingredientId: 'beef-stew-meat', amount: 300, unit: 'g' },
    { ingredientId: 'dried-lime', amount: 3, unit: 'piece' },
  ],
}

describe('withNames', () => {
  it("adds the cuisine's name and each ingredient's name and emoji", () => {
    expect(withNames(meal, catalog)).toEqual({
      id: 'ghormeh-sabzi',
      cuisine: 'persian',
      cuisineName: 'Persian',
      ingredients: [
        {
          ingredientId: 'beef-stew-meat',
          amount: 300,
          unit: 'g',
          name: 'Beef stew meat',
          emoji: '🥩',
        },
        {
          ingredientId: 'dried-lime',
          amount: 3,
          unit: 'piece',
          name: 'Dried lime',
          emoji: undefined,
        },
      ],
    })
  })

  it('shows an id that is not in the catalogue as it is', () => {
    const unknown = {
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
