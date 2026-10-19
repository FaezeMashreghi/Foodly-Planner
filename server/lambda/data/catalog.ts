import { QueryCommand, type QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import type { Meal } from '@shared/meal/meal'
import type { PlanAnswerLabels, PlanAnswers } from '@shared/week-plan/week-plan'
import { db } from './db.ts'
import type { MealItem } from './meals.ts'

export const CATALOG_TABLE = process.env.CATALOG_TABLE ?? 'foodly-catalog'

export const CATALOG_TYPE = Object.freeze({ ingredient: 'ingredient', cuisine: 'cuisine' })

export type IngredientItem = {
  type: 'ingredient'
  id: string
  name: string
  category: string
  unit: string
  emoji?: string
}

export type CuisineItem = { type: 'cuisine'; id: string; name: string }

export type Catalog = {
  ingredients: IngredientItem[]
  cuisines: CuisineItem[]
  ingredientById: Map<string, IngredientItem>
  cuisineById: Map<string, CuisineItem>
}

let catalog: Promise<Catalog> | undefined

/** Read once per Lambda instance, then reused by every call. */
export function loadCatalog() {
  catalog ??= queryCatalog().catch(forgetFailedLoad)
  return catalog
}

function forgetFailedLoad(error: unknown): never {
  catalog = undefined
  throw error
}

async function queryCatalog(): Promise<Catalog> {
  const [ingredients, cuisines] = await Promise.all([
    queryType<IngredientItem>(CATALOG_TYPE.ingredient),
    queryType<CuisineItem>(CATALOG_TYPE.cuisine),
  ])
  return {
    ingredients,
    cuisines,
    ingredientById: new Map(ingredients.map((item) => [item.id, item])),
    cuisineById: new Map(cuisines.map((item) => [item.id, item])),
  }
}

async function queryType<T>(type: string) {
  const items: T[] = []
  let startKey: QueryCommandOutput['LastEvaluatedKey']
  do {
    const page: QueryCommandOutput = await db.send(
      new QueryCommand({
        TableName: CATALOG_TABLE,
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: { ':type': type },
        ExclusiveStartKey: startKey,
      }),
    )
    items.push(...((page.Items ?? []) as T[]))
    startKey = page.LastEvaluatedKey
  } while (startKey)
  return items
}

/** An id that isn't in the catalogue is shown as it is. */
export function withNames(meal: MealItem, { ingredientById, cuisineById }: Catalog): Meal {
  return {
    ...meal,
    cuisineName: cuisineById.get(meal.cuisine)?.name ?? meal.cuisine,
    ingredients: meal.ingredients.map((item) => {
      const ingredient = ingredientById.get(item.ingredientId)
      return { ...item, name: ingredient?.name ?? item.ingredientId, emoji: ingredient?.emoji }
    }),
  }
}

/** Only for showing: the answers keep their ids, which are what is saved and scored. */
export function labelsFor(
  answers: PlanAnswers,
  { ingredientById, cuisineById }: Catalog,
  meals: MealItem[],
): PlanAnswerLabels {
  const ingredientIds = [...answers.expiring, ...answers.wantMore, ...answers.avoid]
  const mustHave = meals.find((meal) => meal.id === answers.mustHaveMealId)
  const labels: PlanAnswerLabels = { ingredients: {}, cuisines: {}, meals: {} }

  for (const id of ingredientIds) {
    const ingredient = ingredientById.get(id)
    if (ingredient) labels.ingredients[id] = { name: ingredient.name, emoji: ingredient.emoji }
  }
  for (const id of answers.cuisines) {
    const cuisine = cuisineById.get(id)
    if (cuisine) labels.cuisines[id] = cuisine.name
  }
  if (mustHave) labels.meals[mustHave.id] = mustHave.name
  return labels
}
