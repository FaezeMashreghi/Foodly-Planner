import type { Meal } from '@shared/meal/meal'
import { setSlotMeal, type PlanSlots, type SlotId } from '@shared/week-plan/week-plan'

/** Puts the meal in the slot and says what happened, for the status message. */
export function placeMeal(
  slots: PlanSlots,
  slotId: SlotId,
  meal: Meal,
  mealsById: ReadonlyMap<string, Meal>,
): { slots: PlanSlots; message: string } {
  const nextSlots = setSlotMeal(slots, slotId, meal.id)
  if (nextSlots === slots) {
    return { slots, message: `${meal.name} is already in ${slotId}` }
  }

  const previousMeal = mealsById.get(slots[slotId] ?? '')
  const message = previousMeal
    ? `Replaced ${previousMeal.name} with ${meal.name} in ${slotId}`
    : `Added ${meal.name} to ${slotId}`
  return { slots: nextSlots, message }
}
