import type { Food } from '@shared/food/food'

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const

export type Day = (typeof DAYS)[number]
export type Meal = (typeof MEALS)[number]

export type SlotId = `${Day} ${Meal}`
/** One food per slot. */
export type WeekPlan = Partial<Record<SlotId, Food>>

export function toSlotId(day: Day, meal: Meal): SlotId {
  return `${day} ${meal}`
}

/** Date.getDay() starts the week on Sunday (0); our week starts on Monday. */
export function dayOf(date: Date): Day {
  return DAYS[(date.getDay() + 6) % 7]
}

export function isSlotId(value: unknown): value is SlotId {
  return DAYS.some((day) => MEALS.some((meal) => toSlotId(day, meal) === value))
}

/** Puts the food in the slot, replacing any food already there. Returns the same plan object if nothing changes. */
export function setSlotFood(plan: WeekPlan, slotId: SlotId, food: Food): WeekPlan {
  if (plan[slotId]?.id === food.id) return plan
  return { ...plan, [slotId]: food }
}
