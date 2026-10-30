import type { Tool } from '@aws-sdk/client-bedrock-runtime'
import { DISH_STYLES, MEAL_TYPES, type DishStyle, type MealType } from '@shared/meal/meal'
import { EMPTY_PLAN_ANSWERS, type PlanAnswers } from '@shared/week-plan/week-plan'
import type { Catalog } from '@server/lambda/data/catalog.ts'
import type { MealItem } from '@server/lambda/data/meals.ts'
import { searchMeals, type SearchInput } from './suggest.ts'

export type KnownIds = { ingredientIds: Set<string>; cuisineIds: Set<string>; mealIds: Set<string> }

export const SEARCH_MEALS = 'search_meals'

export function knownIdsFrom(catalog: Catalog, meals: MealItem[]): KnownIds {
  return {
    ingredientIds: new Set(catalog.ingredientById.keys()),
    cuisineIds: new Set(catalog.cuisineById.keys()),
    mealIds: new Set(meals.map((meal) => meal.id)),
  }
}

/** What the agent gets when it calls search_meals: the model's input is always cleaned first. */
export function runSearchMeals(input: unknown, meals: MealItem[], known: KnownIds) {
  return searchMeals(meals, cleanSearchInput(input, known))
}

/** The week's answers from a cleaned search. dishStyles and mealType aren't saved answers yet. */
export function planAnswersFrom(search: SearchInput): PlanAnswers {
  return {
    ...EMPTY_PLAN_ANSWERS,
    expiring: search.expiring ?? [],
    wantMore: search.wantMore ?? [],
    avoid: search.avoid ?? [],
    cuisines: search.cuisines ?? [],
    easyOnly: search.easyOnly ?? false,
    maxPrepMinutes: search.maxPrepMinutes ?? null,
    mustHaveMealId: search.mustHaveMealId ?? null,
  }
}

/** The tool as the model sees it. The enums come from the real data, so the model picks valid ids. */
export function searchMealsTool({ ingredientIds, cuisineIds, mealIds }: KnownIds): Tool {
  const ingredients = { type: 'array', items: { type: 'string', enum: [...ingredientIds] } }
  return {
    toolSpec: {
      name: SEARCH_MEALS,
      description:
        'Find the best meals for what the user wants, best first (at most 10), each with its ingredient ids and usesWanted (the expiring or wanted ingredients it uses). Meals with an avoided ingredient, of another meal type or over the time limit are never returned, except the dish asked for by name (mustHaveMealId): it always comes first, with hasAvoided listing any avoided ingredients it has, so you can warn the user.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            mealType: { type: 'string', enum: [...MEAL_TYPES] },
            avoid: {
              ...ingredients,
              description: 'Allergies and ingredients the user must not eat',
            },
            expiring: { ...ingredients, description: 'Ingredients going off soon, to use up' },
            wantMore: { ...ingredients, description: 'Ingredients the user would like more of' },
            cuisines: { type: 'array', items: { type: 'string', enum: [...cuisineIds] } },
            dishStyles: { type: 'array', items: { type: 'string', enum: [...DISH_STYLES] } },
            maxPrepMinutes: { type: 'number', description: 'Total time limit in minutes' },
            easyOnly: { type: 'boolean', description: 'The user wants easy meals' },
            mustHaveMealId: {
              type: 'string',
              enum: [...mealIds],
              description: 'A dish the user asked for by name',
            },
          },
        },
      },
    },
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Known ids only. A string can be one id or several separated by commas, so no allergy is lost. */
function knownIds(value: unknown, allowed: Set<string>) {
  const list = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : []
  const ids = list
    .filter((id) => typeof id === 'string')
    .map((id) => id.trim().toLowerCase())
    .filter((id) => allowed.has(id))
  return [...new Set(ids)]
}

const DISH_STYLE_IDS = new Set<string>(DISH_STYLES)

/** A meal type written in any case ('dinner', ' Dinner'), or undefined. */
function mealTypeFrom(value: unknown): MealType | undefined {
  if (typeof value !== 'string') return undefined
  return MEAL_TYPES.find((type) => type.toLowerCase() === value.trim().toLowerCase())
}

/** A time limit sent as a number or a numeric string ('30', '30 minutes'), or undefined. */
function minutesFrom(value: unknown) {
  const minutes = typeof value === 'string' ? Number.parseFloat(value) : value
  return typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0
    ? minutes
    : undefined
}

/** Turns whatever the model sent into a safe search. Broken values are dropped. */
export function cleanSearchInput(input: unknown, known: KnownIds): SearchInput {
  if (!isObject(input)) return {}
  const cleaned: SearchInput = {}

  const avoid = knownIds(input.avoid, known.ingredientIds)
  const expiring = knownIds(input.expiring, known.ingredientIds)
  const wantMore = knownIds(input.wantMore, known.ingredientIds)
  const cuisines = knownIds(input.cuisines, known.cuisineIds)
  const dishStyles = knownIds(input.dishStyles, DISH_STYLE_IDS) as DishStyle[]
  const [mustHaveMealId] = knownIds(input.mustHaveMealId, known.mealIds)
  const mealType = mealTypeFrom(input.mealType)
  const maxPrepMinutes = minutesFrom(input.maxPrepMinutes)

  if (avoid.length) cleaned.avoid = avoid
  if (expiring.length) cleaned.expiring = expiring
  if (wantMore.length) cleaned.wantMore = wantMore
  if (cuisines.length) cleaned.cuisines = cuisines
  if (dishStyles.length) cleaned.dishStyles = dishStyles
  if (mustHaveMealId) cleaned.mustHaveMealId = mustHaveMealId
  if (mealType) cleaned.mealType = mealType
  if (maxPrepMinutes) cleaned.maxPrepMinutes = maxPrepMinutes
  if (input.easyOnly === true || input.easyOnly === 'true') cleaned.easyOnly = true
  return cleaned
}
