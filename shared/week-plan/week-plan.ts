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
export type PlanSlots = Partial<Record<SlotId, string>>

export type Plan = {
  /** The plan's first day; plans made before the start-day question start on a Monday. */
  weekStart: string
  slots: PlanSlots
}

export type PlanSuggestions = Record<MealType, string[]>

export type PlanAnswers = {
  expiring: string[]
  wantMore: string[]
  avoid: string[]
  cuisines: string[]
  easyOnly: boolean
  maxPrepMinutes: number | null
  mustHaveMealId: string | null
  mustHaveText: string | null
  notes: string[]
}

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

/** Only for showing: the answers keep their ids, which are what is saved and scored. */
export type PlanAnswerLabels = {
  ingredients: Partial<Record<string, { name: string; emoji?: string }>>
  cuisines: Partial<Record<string, string>>
  meals: Partial<Record<string, string>>
}

export const EMPTY_PLAN_ANSWER_LABELS: PlanAnswerLabels = {
  ingredients: {},
  cuisines: {},
  meals: {},
}

export function toSlotId(day: Day, meal: MealType): SlotId {
  return `${day} ${meal}`
}

// Date.getDay() starts the week on Sunday (0); ours starts on Monday.
export function dayOf(date: Date): Day {
  return DAYS[(date.getDay() + 6) % 7]
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function weekStartOf(date: Date): string {
  return toIsoDate(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - DAYS.indexOf(dayOf(date))),
  )
}

export function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    toIsoDate(new Date(`${value}T00:00`)) === value
  )
}

export function daysFrom(startDate: string): Day[] {
  const first = DAYS.indexOf(dayOf(new Date(`${startDate}T00:00`)))
  return DAYS.map((_, i) => DAYS[(first + i) % 7])
}

export function nextSevenDays(today: Date): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)),
  )
}

export function isSlotId(value: unknown): value is SlotId {
  return DAYS.some((day) => MEAL_TYPES.some((meal) => toSlotId(day, meal) === value))
}

// Returns the same object when nothing changes, so React skips the re-render.
export function setSlotMeal(slots: PlanSlots, slotId: SlotId, mealId: string): PlanSlots {
  if (slots[slotId] === mealId) return slots
  return { ...slots, [slotId]: mealId }
}
