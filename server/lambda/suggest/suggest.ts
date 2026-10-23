import { MEAL_TYPES, type DishStyle, type MealType } from '@shared/meal/meal'
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
  dishStyle: 2,
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
 * left out, except the must-have dish (the user asked for it by name), which comes first; the rest are sorted
 * by score, then by id so the same answers always give the same list.
 */
export function suggestMeals(
  meals: MealItem[],
  answers: PlanAnswers = EMPTY_PLAN_ANSWERS,
): PlanSuggestions {
  const ranked = rankMeals(meals.filter(isAllowed(answers)), answers)

  return Object.fromEntries(
    MEAL_TYPES.map((mealType) => [
      mealType,
      ranked
        .filter((meal) => meal.mealTypes.includes(mealType))
        .slice(0, SUGGESTIONS_PER_MEAL_TYPE)
        .map((meal) => meal.id),
    ]),
  ) as PlanSuggestions
}

/** The avoid list is a hard filter for every meal except the must-have dish. */
function isAllowed(answers: PlanAnswers) {
  const avoid = new Set(answers.avoid)
  return (meal: MealItem) =>
    meal.id === answers.mustHaveMealId ||
    !meal.ingredients.some((item) => avoid.has(item.ingredientId))
}

/**
 * Must-have dish first, then (if given) the meals `isPreferred` picks, then by score, then by id
 * so the same answers always give the same list.
 */
function rankMeals(
  meals: MealItem[],
  answers: PlanAnswers,
  {
    extraPoints = () => 0,
    isPreferred = () => false,
  }: { extraPoints?: (meal: MealItem) => number; isPreferred?: (meal: MealItem) => boolean } = {},
) {
  const isMustHave = (meal: MealItem) => meal.id === answers.mustHaveMealId
  return meals
    .map((meal) => ({ meal, score: scoreMeal(meal, answers) + extraPoints(meal) }))
    .sort(
      (a, b) =>
        Number(isMustHave(b.meal)) - Number(isMustHave(a.meal)) ||
        Number(isPreferred(b.meal)) - Number(isPreferred(a.meal)) ||
        b.score - a.score ||
        a.meal.id.localeCompare(b.meal.id),
    )
    .map(({ meal }) => meal)
}

export const SEARCH_LIMIT = 10

export type SearchInput = Partial<PlanAnswers> & { dishStyles?: DishStyle[]; mealType?: MealType }

/**
 * The best meals for the agent. Avoided ingredients, the meal type and the time limit are hard
 * filters, except for a dish asked for by name: it skips them all and comes first (with the avoided
 * ingredients it has, so the model can warn the user). Then meals in the cuisines the user named;
 * other cuisines only fill the rest.
 */
export function searchMeals(meals: MealItem[], input: SearchInput) {
  const answers = { ...EMPTY_PLAN_ANSWERS, ...input }
  const avoid = new Set(answers.avoid)
  const styles = new Set(input.dishStyles)
  const wanted = new Set([...answers.expiring, ...answers.wantMore])
  const isMustHave = (meal: MealItem) => meal.id === answers.mustHaveMealId
  const inAskedCuisine = (meal: MealItem) => answers.cuisines.includes(meal.cuisine)
  const dishStylePoints = (meal: MealItem) =>
    meal.dishStyles?.some((style) => styles.has(style)) ? POINTS.dishStyle : 0

  const allowed = meals.filter(isAllowed(answers)).filter((meal) => {
    if (isMustHave(meal)) return true
    if (input.mealType && !meal.mealTypes.includes(input.mealType)) return false
    return answers.maxPrepMinutes === null || meal.prepMinutes <= answers.maxPrepMinutes
  })

  const ranked = rankMeals(allowed, answers, {
    extraPoints: dishStylePoints,
    isPreferred: inAskedCuisine,
  }).slice(0, SEARCH_LIMIT)

  return {
    meals: ranked.map((meal) => {
      const ingredientIds = meal.ingredients.map((item) => item.ingredientId)
      return {
        id: meal.id,
        name: meal.name,
        cuisine: meal.cuisine,
        prepMinutes: meal.prepMinutes,
        activeMinutes: meal.activeMinutes ?? meal.prepMinutes,
        dishStyles: meal.dishStyles ?? [],
        ingredients: ingredientIds,
        // Worked out here so the model doesn't have to find them (and claim ones that aren't there).
        usesWanted: ingredientIds.filter((id) => wanted.has(id)),
        ...(isMustHave(meal) && { hasAvoided: ingredientIds.filter((id) => avoid.has(id)) }),
      }
    }),
  }
}
