import { MEAL_TYPES, type MealType } from '@shared/meal/meal'
import { daysFrom, toSlotId, type Day, type Plan } from '@shared/week-plan/week-plan'

export type DayMeals = {
  day: Day
  meals: { mealType: MealType; mealId: string }[]
}

/** The plan's filled slots grouped by day, in plan order; days without meals are left out. */
export function weekMeals(plan: Plan): DayMeals[] {
  return daysFrom(plan.weekStart)
    .map((day) => ({ day, meals: mealsOfDay(plan, day) }))
    .filter((dayMeals) => dayMeals.meals.length > 0)
}

function mealsOfDay(plan: Plan, day: Day) {
  return MEAL_TYPES.flatMap((mealType) => {
    const mealId = plan.slots[toSlotId(day, mealType)]
    return mealId ? [{ mealType, mealId }] : []
  })
}
