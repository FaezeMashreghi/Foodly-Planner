import { ScanCommand, type ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
import type { Ingredient, Meal } from '@shared/meal/meal'
import { db } from './db.ts'

// The fallback is for eval.ts, run on your machine; the Lambda gets it from infra.
export const MEALS_TABLE = process.env.MEALS_TABLE ?? 'foodly-meals'

/** A meal as stored. GET /meals adds the names (withNames in catalog.ts). */
export type MealItem = Omit<Meal, 'cuisineName' | 'ingredients'> & {
  ingredients: Omit<Ingredient, 'name' | 'emoji'>[]
}

// Every Meal field except recipe, which is large and loaded on its own. Add new Meal fields here.
const FIELDS = [
  'id',
  'name',
  'emoji',
  'mealTypes',
  'cuisine',
  'difficulty',
  'prepMinutes',
  'activeMinutes',
  'dishStyles',
  'servings',
  'ingredients',
  'image',
  'source',
]
// "#name" placeholders, because some field names (name, source) are DynamoDB reserved words.
const PROJECTION = FIELDS.map((field) => `#${field}`).join(', ')
const FIELD_NAMES = Object.fromEntries(FIELDS.map((field) => [`#${field}`, field]))

let meals: Promise<MealItem[]> | undefined

/** All meals without their recipes. Read once per Lambda instance, then reused by every call. */
export function loadMeals() {
  meals ??= scanMeals().catch(forgetFailedLoad)
  return meals
}

function forgetFailedLoad(error: unknown): never {
  meals = undefined
  throw error
}

async function scanMeals() {
  const items: MealItem[] = []
  let startKey: ScanCommandOutput['LastEvaluatedKey']
  do {
    const page: ScanCommandOutput = await db.send(
      new ScanCommand({
        TableName: MEALS_TABLE,
        ProjectionExpression: PROJECTION,
        ExpressionAttributeNames: FIELD_NAMES,
        ExclusiveStartKey: startKey,
      }),
    )
    items.push(...((page.Items ?? []) as MealItem[]))
    startKey = page.LastEvaluatedKey
  } while (startKey)
  return items
}
