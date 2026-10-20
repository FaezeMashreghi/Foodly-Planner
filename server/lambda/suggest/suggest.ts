import { MEAL_TYPES } from '@shared/meal/meal'
import {
  EMPTY_PLAN_ANSWERS,
  type PlanAnswers,
  type PlanSuggestions,
} from '@shared/week-plan/week-plan'
import type { MealItem } from '@server/lambda/data/meals.ts'

export const SUGGESTIONS_PER_MEAL_TYPE = 10

// How much each match counts. The must-have dish doesn't need points: it always goes first.
const POINTS = {
  expiring: 3,
  cuisine: 2,
  wantMore: 1,
  maxWantMore: 3,
  easy: 1,
  notEasy: -1,
  tooSlow: -3,
}

/** A meal's score for the user's answers. Higher is a better fit. */
export function scoreMeal(meal: MealItem, answers: PlanAnswers) {
  const ingredients = new Set(meal.ingredients.map((item) => item.ingredientId))
  const uses = (ids: string[]) => ids.filter((id) => ingredients.has(id)).length

  let score = uses(answers.expiring) * POINTS.expiring
  score += Math.min(uses(answers.wantMore), POINTS.maxWantMore) * POINTS.wantMore
  if (answers.cuisines.includes(meal.cuisine)) score += POINTS.cuisine
  if (answers.easyOnly) score += meal.difficulty === 'easy' ? POINTS.easy : POINTS.notEasy
  if (answers.maxPrepMinutes !== null && meal.prepMinutes > answers.maxPrepMinutes) {
    score += POINTS.tooSlow
  }
  return score
}

/**
 * The meal ids to suggest for each meal type, best first. Meals with an ingredient to avoid are
 * left out (safety beats the must-have dish); the must-have dish comes first; the rest are sorted
 * by score, then by id so the same answers always give the same list.
 */
export function suggestMeals(
  meals: MealItem[],
  answers: PlanAnswers = EMPTY_PLAN_ANSWERS,
): PlanSuggestions {
  const avoid = new Set(answers.avoid)
  const allowed = meals.filter(
    (meal) => !meal.ingredients.some((item) => avoid.has(item.ingredientId)),
  )
  const ranked = allowed
    .map((meal) => ({ meal, score: scoreMeal(meal, answers) }))
    .sort(
      (a, b) =>
        Number(b.meal.id === answers.mustHaveMealId) -
          Number(a.meal.id === answers.mustHaveMealId) ||
        b.score - a.score ||
        a.meal.id.localeCompare(b.meal.id),
    )

  return Object.fromEntries(
    MEAL_TYPES.map((mealType) => [
      mealType,
      ranked
        .filter(({ meal }) => meal.mealTypes.includes(mealType))
        .slice(0, SUGGESTIONS_PER_MEAL_TYPE)
        .map(({ meal }) => meal.id),
    ]),
  ) as PlanSuggestions
}
