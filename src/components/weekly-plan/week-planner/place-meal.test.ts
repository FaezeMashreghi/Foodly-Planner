import { describe, expect, it } from 'vitest'
import type { Meal } from '@shared/meal/meal'
import { placeMeal } from './place-meal'

function makeMeal(id: string, name: string): Meal {
  return {
    id,
    name,
    emoji: '🍽️',
    mealTypes: ['Dinner'],
    cuisine: 'persian',
    difficulty: 'easy',
    prepMinutes: 30,
    servings: 2,
    ingredients: [],
    source: 'seed',
  }
}

const ghormeh = makeMeal('ghormeh-sabzi', 'Ghormeh sabzi')
const pasta = makeMeal('pasta', 'Pasta')
const mealsById = new Map([ghormeh, pasta].map((meal) => [meal.id, meal]))

describe('placeMeal', () => {
  it('adds a meal to an empty slot', () => {
    const result = placeMeal({}, 'Monday Dinner', ghormeh, mealsById)

    expect(result.slots).toEqual({ 'Monday Dinner': 'ghormeh-sabzi' })
    expect(result.message).toBe('Added Ghormeh sabzi to Monday Dinner')
  })

  it('replaces the meal already in the slot', () => {
    const result = placeMeal({ 'Monday Dinner': 'pasta' }, 'Monday Dinner', ghormeh, mealsById)

    expect(result.slots).toEqual({ 'Monday Dinner': 'ghormeh-sabzi' })
    expect(result.message).toBe('Replaced Pasta with Ghormeh sabzi in Monday Dinner')
  })

  it('changes nothing when the meal is already in the slot', () => {
    const slots = { 'Monday Dinner': 'ghormeh-sabzi' }
    const result = placeMeal(slots, 'Monday Dinner', ghormeh, mealsById)

    expect(result.slots).toBe(slots)
    expect(result.message).toBe('Ghormeh sabzi is already in Monday Dinner')
  })
})
