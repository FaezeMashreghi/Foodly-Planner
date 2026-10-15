import { MEAL_TYPES, type Meal, type MealType } from '@shared/meal/meal'
import type { Day, PlanSlots, PlanSuggestions, SlotId } from '@shared/week-plan/week-plan'

export type MealChoices = Record<MealType, Meal[]>

export type PlaceMealInSlot = (slotId: SlotId, meal: Meal) => void

/** Suggestions load on their own: the week shows even while they're loading or if they fail. */
export type SuggestionsState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'success'; choices: MealChoices }

export type UnavailableSuggestionsState = Exclude<SuggestionsState, { status: 'success' }>

export type WeekViewProps = {
  days: Day[]
  slots: PlanSlots
  mealsById: ReadonlyMap<string, Meal>
  suggestions: SuggestionsState
  onPlace: PlaceMealInSlot
}

export function toMealChoices(
  suggestions: PlanSuggestions,
  mealsById: ReadonlyMap<string, Meal>,
): MealChoices {
  const choices = {} as MealChoices
  for (const mealType of MEAL_TYPES) {
    choices[mealType] = suggestions[mealType].flatMap((id) => mealsById.get(id) ?? [])
  }
  return choices
}
