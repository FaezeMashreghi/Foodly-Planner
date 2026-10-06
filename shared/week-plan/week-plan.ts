import type { CuisineId } from '@shared/meal/cuisines'
import type { IngredientId } from '@shared/meal/ingredients'
import { MEAL_TYPES, type MealType } from '@shared/meal/meal'

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export type Day = (typeof DAYS)[number]

export type SlotId = `${Day} ${MealType}`
/** A saved week: one meal id per filled slot, e.g. { "Monday Dinner": "ghormeh-sabzi" }. */
export type PlanSlots = Partial<Record<SlotId, string>>

export type Plan = {
  /** The first day of the plan, "2026-09-29"; the plan is 7 days from it. Plans made before
   * the start-day question start on a Monday. */
  weekStart: string
  slots: PlanSlots
}

/** Meal ids to suggest per meal type, best first. Scored by the backend (decision 22). */
export type PlanSuggestions = Record<MealType, string[]>

/** What the AI understood from the user's text; editable on the "We understood" screen. */
export type PlanAnswers = {
  expiring: IngredientId[]
  wantMore: IngredientId[]
  /** Meals with any of these are left out. */
  avoid: IngredientId[]
  cuisines: CuisineId[]
  easyOnly: boolean
  maxPrepMinutes: number | null
  /** The catalogue meal matching the dish they want, if there is one. */
  mustHaveMealId: string | null
  /** The dish in the user's own words. */
  mustHaveText: string | null
  /** Useful things that don't fit the fields above, e.g. "More time on Sunday." */
  notes: string[]
}

/** Answers where the user mentioned nothing, e.g. when every question was left empty. */
export const EMPTY_PLAN_ANSWERS: PlanAnswers = {
  expiring: [],
  wantMore: [],
  avoid: [],
  cuisines: [],
  easyOnly: false,
  maxPrepMinutes: null,
  mustHaveMealId: null,
  mustHaveText: null,
  notes: [],
}

export function toSlotId(day: Day, meal: MealType): SlotId {
  return `${day} ${meal}`
}

/** Date.getDay() starts the week on Sunday (0); our week starts on Monday. */
export function dayOf(date: Date): Day {
  return DAYS[(date.getDay() + 6) % 7]
}

/** The date in local time as "2026-09-28". */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** The Monday of the week that contains `date`, in local time, as "2026-09-28". */
export function weekStartOf(date: Date): string {
  return toIsoDate(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - DAYS.indexOf(dayOf(date))),
  )
}

/** True for a real date written as "2026-09-28" (not "2026-13-40"). */
export function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    toIsoDate(new Date(`${value}T00:00`)) === value
  )
}

/** The 7 days of a plan in order, from its start day: "2026-10-01" → Thursday … Wednesday. */
export function daysFrom(startDate: string): Day[] {
  const first = DAYS.indexOf(dayOf(new Date(`${startDate}T00:00`)))
  return DAYS.map((_, i) => DAYS[(first + i) % 7])
}

/** Today and the 6 days after it, the days a plan can start on. */
export function nextSevenDays(today: Date): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)),
  )
}

export function isSlotId(value: unknown): value is SlotId {
  return DAYS.some((day) => MEAL_TYPES.some((meal) => toSlotId(day, meal) === value))
}

/** Puts the meal in the slot, replacing any meal already there. Returns the same object if nothing changes. */
export function setSlotMeal(slots: PlanSlots, slotId: SlotId, mealId: string): PlanSlots {
  if (slots[slotId] === mealId) return slots
  return { ...slots, [slotId]: mealId }
}
