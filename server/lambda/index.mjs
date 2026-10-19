import { GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db } from './data/db.mjs'
import { labelsFor, loadCatalog, withNames } from './data/catalog.mjs'
import { loadMeals } from './data/meals.mjs'
import { claimDailyCall } from './data/usage.mjs'
import { checkAnswers, understand } from './understand/understand.mjs'
import { getRecipe } from './recipe/recipe.mjs'
import { suggestMeals } from './suggest/suggest.mjs'

const PLANS_TABLE = process.env.PLANS_TABLE
// Each call costs Bedrock tokens; this caps what one user can spend in a day.
const UNDERSTAND_CALLS_PER_DAY = 20

export const handler = async (event) => {
  try {
    return await route(event)
  } catch (error) {
    console.error('request failed', event.routeKey, error)
    if (error.name === 'ThrottlingException') {
      return json(503, { message: 'The service is busy. Please try again in a moment.' })
    }
    return json(500, { message: 'Something went wrong' })
  }
}

function route(event) {
  const userId = event.requestContext.authorizer.jwt.claims.sub

  switch (event.routeKey) {
    case 'GET /meals':
      return getMeals()
    case 'GET /catalog':
      return getCatalog()
    case 'POST /meals/{id}/recipe':
      return recipeFor(event.pathParameters?.id)
    case 'GET /plan':
      return getPlan(userId, event.queryStringParameters?.week)
    case 'PUT /plan':
      return savePlan(userId, event.body)
    case 'PUT /plan/answers':
      return saveAnswers(userId, event.body)
    case 'POST /plan/understand':
      return understandText(userId, event.body)
    case 'GET /plan/suggestions':
      return getSuggestions(userId, event.queryStringParameters?.week)
    case 'GET /plans':
      return getPlanHistory(userId)
    default:
      return json(404, { message: 'Not found' })
  }
}

async function getMeals() {
  const [meals, catalog] = await Promise.all([loadMeals(), loadCatalog().catch(noCatalog)])
  return json(
    200,
    meals.map((meal) => withNames(meal, catalog)),
  )
}

function noCatalog(error) {
  console.error('catalog failed, sending meals without names', error)
  return { ingredientById: new Map(), cuisineById: new Map() }
}

async function getCatalog() {
  const { ingredients, cuisines } = await loadCatalog()
  return json(200, {
    ingredients: ingredients.map(withoutType),
    cuisines: cuisines.map(withoutType),
  })
}

// `type` is how the table groups items, not part of the API.
function withoutType({ type, ...item }) {
  return item
}

async function recipeFor(mealId) {
  if (typeof mealId !== 'string' || !MEAL_ID.test(mealId)) {
    return json(400, { message: 'Invalid meal id' })
  }

  const recipe = await getRecipe(mealId)
  return recipe ? json(200, recipe) : json(404, { message: 'Meal not found' })
}

async function getPlan(userId, weekStart) {
  if (!isWeekStart(weekStart)) return json(400, { message: 'week must look like 2026-09-28' })

  const { Item } = await db.send(
    new GetCommand({ TableName: PLANS_TABLE, Key: { userId, weekStart }, ConsistentRead: true }),
  )
  return json(200, { weekStart, slots: Item?.slots ?? {} })
}

// A Query returns at most 1 MB, so keep reading while DynamoDB says there's another page.
async function getPlanHistory(userId) {
  const plans = []
  let startKey
  do {
    const page = await db.send(
      new QueryCommand({
        TableName: PLANS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        ProjectionExpression: 'weekStart, slots',
        ScanIndexForward: false,
        ConsistentRead: true,
        ExclusiveStartKey: startKey,
      }),
    )
    plans.push(...page.Items)
    startKey = page.LastEvaluatedKey
  } while (startKey)

  return json(200, { plans: plans.filter(hasMeals) })
}

function hasMeals(plan) {
  return Object.keys(plan.slots ?? {}).length > 0
}

async function getSuggestions(userId, weekStart) {
  if (!isWeekStart(weekStart)) return json(400, { message: 'week must look like 2026-09-28' })

  const [{ Item }, meals] = await Promise.all([
    db.send(
      new GetCommand({ TableName: PLANS_TABLE, Key: { userId, weekStart }, ConsistentRead: true }),
    ),
    loadMeals(),
  ])
  return json(200, suggestMeals(meals, Item?.answers))
}

// UpdateCommand, not PutCommand: a Put would replace the whole item and delete the answers.
async function savePlan(userId, body) {
  const plan = parseJson(body)
  if (!plan || !isWeekStart(plan.weekStart) || !isSlots(plan.slots)) {
    return json(400, { message: 'Invalid plan' })
  }

  await update(userId, plan.weekStart, 'slots', plan.slots)
  return json(200, { weekStart: plan.weekStart, slots: plan.slots })
}

async function saveAnswers(userId, body) {
  const request = parseJson(body)
  if (!request || !isWeekStart(request.weekStart) || !isObject(request.answers)) {
    return json(400, { message: 'Invalid answers' })
  }

  const answers = await checkAnswers(request.answers)
  await update(userId, request.weekStart, 'answers', answers)
  return json(200, { weekStart: request.weekStart, answers })
}

/** Sets one field of a plan, creating the plan if it doesn't exist yet. */
function update(userId, weekStart, field, value) {
  return db.send(
    new UpdateCommand({
      TableName: PLANS_TABLE,
      Key: { userId, weekStart },
      UpdateExpression: 'SET #field = :value, updatedAt = :now',
      ExpressionAttributeNames: { '#field': field },
      ExpressionAttributeValues: { ':value': value, ':now': new Date().toISOString() },
    }),
  )
}

async function understandText(userId, body) {
  const request = parseJson(body)
  const text = typeof request?.text === 'string' ? request.text.trim() : ''
  if (!text || text.length > 2000) {
    return json(400, { message: 'text must be 1 to 2000 characters' })
  }
  if (!(await claimDailyCall(userId, 'understand', UNDERSTAND_CALLS_PER_DAY))) {
    return json(429, { code: 'daily-limit', message: 'Daily limit reached' })
  }

  const [answers, catalog, meals] = await Promise.all([
    understand(text),
    loadCatalog(),
    loadMeals(),
  ])
  return json(200, { ...answers, labels: labelsFor(answers, catalog, meals) })
}

const SLOT_ID =
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) (Breakfast|Lunch|Dinner)$/
const MEAL_ID = /^[a-z0-9-]{1,80}$/

function isWeekStart(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isSlots(value) {
  return (
    isObject(value) &&
    Object.entries(value).every(
      ([slotId, mealId]) =>
        SLOT_ID.test(slotId) && typeof mealId === 'string' && MEAL_ID.test(mealId),
    )
  )
}

function parseJson(text) {
  try {
    return JSON.parse(text ?? '')
  } catch {
    return null
  }
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  }
}
