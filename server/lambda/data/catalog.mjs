import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db } from './db.mjs'

// The fallback is for scripts and eval.mjs, run on your machine; the Lambda gets it from infra.
export const CATALOG_TABLE = process.env.CATALOG_TABLE ?? 'foodly-catalog'

/** The `type` key of each kind of item in foodly-catalog. */
export const CATALOG_TYPE = Object.freeze({ ingredient: 'ingredient', cuisine: 'cuisine' })

let catalog

/** All ingredients and cuisines, as lists and as Maps by id. Read once per Lambda instance, then reused by every call. */
export function loadCatalog() {
  catalog ??= queryCatalog().catch(forgetFailedLoad)
  return catalog
}

function forgetFailedLoad(error) {
  catalog = undefined
  throw error
}

async function queryCatalog() {
  const [ingredients, cuisines] = await Promise.all([
    queryType(CATALOG_TYPE.ingredient),
    queryType(CATALOG_TYPE.cuisine),
  ])
  return {
    ingredients,
    cuisines,
    ingredientById: new Map(ingredients.map((item) => [item.id, item])),
    cuisineById: new Map(cuisines.map((item) => [item.id, item])),
  }
}

/**
 * The meal as GET /meals sends it: with its cuisine's name and each ingredient's name and emoji,
 * so the browser doesn't need the catalogue. An id that isn't in the catalogue is shown as it is.
 */
export function withNames(meal, { ingredientById, cuisineById }) {
  return {
    ...meal,
    cuisineName: cuisineById.get(meal.cuisine)?.name ?? meal.cuisine,
    ingredients: meal.ingredients.map((item) => {
      const ingredient = ingredientById.get(item.ingredientId)
      return { ...item, name: ingredient?.name ?? item.ingredientId, emoji: ingredient?.emoji }
    }),
  }
}

async function queryType(type) {
  const items = []
  let startKey
  do {
    const page = await db.send(
      new QueryCommand({
        TableName: CATALOG_TABLE,
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: { ':type': type },
        ExclusiveStartKey: startKey,
      }),
    )
    items.push(...(page.Items ?? []))
    startKey = page.LastEvaluatedKey
  } while (startKey)
  return items
}

/**
 * Names for the ids in the AI's answers, so the review screen can show them without the catalogue.
 * Only for showing: the answers keep their ids, which are what is saved and scored.
 * An id that isn't in the catalogue gets no name (the screen shows the id).
 */
export function labelsFor(answers, { ingredientById, cuisineById }, meals) {
  const ingredientIds = [...answers.expiring, ...answers.wantMore, ...answers.avoid]
  const mustHave = meals.find((meal) => meal.id === answers.mustHaveMealId)

  function ingredientLabel(id) {
    const { name, emoji } = ingredientById.get(id)
    return [id, { name, emoji }]
  }

  return {
    ingredients: Object.fromEntries(
      ingredientIds.filter((id) => ingredientById.has(id)).map(ingredientLabel),
    ),
    cuisines: Object.fromEntries(
      answers.cuisines
        .filter((id) => cuisineById.has(id))
        .map((id) => [id, cuisineById.get(id).name]),
    ),
    meals: mustHave ? { [mustHave.id]: mustHave.name } : {},
  }
}
