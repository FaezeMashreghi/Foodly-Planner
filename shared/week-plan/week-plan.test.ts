import { describe, expect, it } from 'vitest'
import type { Food } from '@shared/food/food'
import { dayOf, isSlotId, setSlotFood } from './week-plan'

const pasta: Food = { id: 'pasta', title: 'Pasta', description: '', imageUrl: '' }
const salad: Food = { id: 'salad', title: 'Salad', description: '', imageUrl: '' }

describe('setSlotFood', () => {
  it('puts a food in an empty slot', () => {
    expect(setSlotFood({}, 'Monday Dinner', pasta)).toEqual({ 'Monday Dinner': pasta })
  })

  it('replaces the food already in the slot', () => {
    const plan = { 'Monday Dinner': pasta }
    expect(setSlotFood(plan, 'Monday Dinner', salad)).toEqual({ 'Monday Dinner': salad })
  })

  it('leaves other slots alone', () => {
    const plan = { 'Monday Lunch': pasta }
    expect(setSlotFood(plan, 'Monday Dinner', salad)).toEqual({
      'Monday Lunch': pasta,
      'Monday Dinner': salad,
    })
  })

  it('returns the same plan when that food is already in the slot', () => {
    const plan = { 'Monday Dinner': pasta }
    expect(setSlotFood(plan, 'Monday Dinner', pasta)).toBe(plan)
  })

  it('does not change the original plan', () => {
    const plan = {}
    setSlotFood(plan, 'Monday Dinner', pasta)
    expect(plan).toEqual({})
  })
})

describe('isSlotId', () => {
  it('accepts a day and meal', () => {
    expect(isSlotId('Friday Lunch')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isSlotId('Funday Lunch')).toBe(false)
    expect(isSlotId(42)).toBe(false)
  })
})

describe('dayOf', () => {
  it('returns the day of the week, starting on Monday', () => {
    expect(dayOf(new Date(2026, 8, 21))).toBe('Monday')
    expect(dayOf(new Date(2026, 8, 27))).toBe('Sunday')
  })
})
