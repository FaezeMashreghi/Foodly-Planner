import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { db } from './db.mjs'

// The fallback is for eval.mjs, run on your machine; the Lambda gets it from infra.
export const MEALS_TABLE = process.env.MEALS_TABLE ?? 'foodly-meals'

// Every Meal field except recipe, which is large and loaded on its own. Add new Meal fields here.
const FIELDS = [
  'id',
  'name',
  'emoji',
  'mealTypes',
  'cuisine',
  'difficulty',
  'prepMinutes',
  'servings',
  'ingredients',
  'image',
  'source',
]
// "#name" placeholders, because some field names (name, source) are DynamoDB reserved words.
const PROJECTION = FIELDS.map((field) => `#${field}`).join(', ')
const FIELD_NAMES = Object.fromEntries(FIELDS.map((field) => [`#${field}`, field]))

let meals

/** All meals without their recipes. Read once per Lambda instance, then reused by every call. */
export function loadMeals() {
  meals ??= scanMeals().catch(forgetFailedLoad)
  return meals
}

function forgetFailedLoad(error) {
  meals = undefined
  throw error
}

async function scanMeals() {
  const items = []
  let startKey
  do {
    const page = await db.send(
      new ScanCommand({
        TableName: MEALS_TABLE,
        ProjectionExpression: PROJECTION,
        ExpressionAttributeNames: FIELD_NAMES,
        ExclusiveStartKey: startKey,
      }),
    )
    items.push(...(page.Items ?? []))
    startKey = page.LastEvaluatedKey
  } while (startKey)
  return items
}
