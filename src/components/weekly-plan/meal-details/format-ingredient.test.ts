import { describe, expect, it } from 'vitest'
import { formatIngredient } from './format-ingredient'

describe('formatIngredient', () => {
  it('shows the amount, unit and name', () => {
    expect(
      formatIngredient({
        ingredientId: 'beef-stew-meat',
        amount: 300,
        unit: 'g',
        name: 'Beef stew meat',
      }),
    ).toBe('300 g Beef stew meat')
  })

  it('shows pieces as a count', () => {
    expect(
      formatIngredient({
        ingredientId: 'dried-lime',
        amount: 3,
        unit: 'piece',
        name: 'Dried lime',
      }),
    ).toBe('3 × Dried lime')
  })
})
