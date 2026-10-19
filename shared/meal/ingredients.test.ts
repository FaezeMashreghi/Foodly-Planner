import { describe, expect, it } from 'vitest'
import { getIngredient } from './ingredients'

describe('getIngredient', () => {
  it('finds an ingredient by its id', () => {
    expect(getIngredient('aubergine')).toMatchObject({ name: 'Aubergine', emoji: '🍆' })
  })

  it('returns undefined for an id we do not know', () => {
    expect(getIngredient('dragon-fruit')).toBeUndefined()
  })
})
