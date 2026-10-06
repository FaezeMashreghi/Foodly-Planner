import { describe, expect, it } from 'vitest'
import { INGREDIENTS } from './ingredients'
import { SEED_MEALS } from './seed-meals'

const unitOf = new Map<string, string>(INGREDIENTS.map((item) => [item.id, item.unit]))

describe('SEED_MEALS', () => {
  it('has a unique id for every meal', () => {
    const ids = SEED_MEALS.map((meal) => meal.id)
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([])
  })

  it('uses each ingredient in its own unit', () => {
    const wrong = SEED_MEALS.flatMap((meal) =>
      meal.ingredients
        .filter((item) => item.unit !== unitOf.get(item.ingredientId))
        .map((item) => `${meal.id}: ${item.ingredientId} in ${item.unit}`),
    )
    expect(wrong).toEqual([])
  })

  it('lists each ingredient once per meal, with a positive amount', () => {
    const wrong = SEED_MEALS.filter((meal) => {
      const ids = meal.ingredients.map((item) => item.ingredientId)
      return new Set(ids).size !== ids.length || meal.ingredients.some((item) => item.amount <= 0)
    }).map((meal) => meal.id)
    expect(wrong).toEqual([])
  })

  it('has at least one meal type and a realistic time', () => {
    const wrong = SEED_MEALS.filter(
      (meal) => meal.mealTypes.length === 0 || meal.prepMinutes <= 0 || meal.prepMinutes > 240,
    ).map((meal) => meal.id)
    expect(wrong).toEqual([])
  })
})
