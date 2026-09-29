import { describe, expect, it } from 'vitest'
import { describeCookingTime, toIngredientChips } from './review-text'

describe('toIngredientChips', () => {
  it('gives each ingredient its name and emoji', () => {
    expect(toIngredientChips(['aubergine', 'courgette'])).toEqual([
      { id: 'aubergine', label: 'Aubergine', emoji: '🍆' },
      { id: 'courgette', label: 'Courgette', emoji: undefined },
    ])
  })

  it('shows an unknown id as it is', () => {
    expect(toIngredientChips(['dragon-fruit'])).toEqual([
      { id: 'dragon-fruit', label: 'dragon-fruit', emoji: undefined },
    ])
  })
})

describe('describeCookingTime', () => {
  it('describes a time limit, with or without "quick and easy"', () => {
    expect(describeCookingTime({ easyOnly: false, maxPrepMinutes: 45 })).toBe('Up to 45 minutes')
    expect(describeCookingTime({ easyOnly: true, maxPrepMinutes: 30 })).toBe(
      'Quick and easy, up to 30 minutes',
    )
  })

  it('describes "quick and easy" without a time limit', () => {
    expect(describeCookingTime({ easyOnly: true, maxPrepMinutes: null })).toBe(
      'Quick and easy meals',
    )
  })

  it('returns null when cooking time was not mentioned', () => {
    expect(describeCookingTime({ easyOnly: false, maxPrepMinutes: null })).toBeNull()
  })
})
