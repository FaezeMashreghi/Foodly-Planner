import { describe, expect, it } from 'vitest'
import { formatIngredient, getIngredient } from './ingredients'

describe('getIngredient', () => {
  it('finds an ingredient by its id', () => {
    expect(getIngredient('aubergine')).toMatchObject({ name: 'Aubergine', emoji: '🍆' })
  })

  it('returns undefined for an id we do not know', () => {
    expect(getIngredient('dragon-fruit')).toBeUndefined()
  })
})

describe('formatIngredient', () => {
  it('shows the amount, unit and name', () => {
    expect(formatIngredient({ ingredientId: 'beef-stew-meat', amount: 300, unit: 'g' })).toBe(
      '300 g Beef stew meat',
    )
  })

  it('shows pieces as a count', () => {
    expect(formatIngredient({ ingredientId: 'dried-lime', amount: 3, unit: 'piece' })).toBe(
      '3 × Dried lime',
    )
  })

  it('falls back to the id for an ingredient we do not know', () => {
    // @ts-expect-error: an id from old data that is no longer in the list
    expect(formatIngredient({ ingredientId: 'dragon-fruit', amount: 1, unit: 'piece' })).toBe(
      '1 × dragon-fruit',
    )
  })
})
