import { randomUUID } from 'node:crypto'
import type { Message } from '@aws-sdk/client-bedrock-runtime'
import {
  GetCommand,
  QueryCommand,
  UpdateCommand,
  type QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'
import {
  EMPTY_PLAN_ANSWER_LABELS,
  EMPTY_PLAN_ANSWERS,
  isIsoDate,
  isSlotId,
  type Plan,
  type PlanAnswers,
  type PlanSlots,
} from '@shared/week-plan/week-plan'
import { runTurn, type RunTool } from './agent/loop.ts'
import { bedrockModel } from './agent/model.ts'
import { planPrompt } from './agent/prompt.ts'
import { labelsFor, loadCatalog, withNames, type Catalog } from './data/catalog.ts'
import { getChat, saveChat, type Chat } from './data/chats.ts'
import { db } from './data/db.ts'
import { loadMeals } from './data/meals.ts'
import { claimDailyCall } from './data/usage.ts'
import { getRecipe } from './recipe/recipe.ts'
import {
  cleanSearchInput,
  knownIdsFrom,
  planAnswersFrom,
  SEARCH_MEALS,
  searchMealsTool,
} from './suggest/search-tool.ts'
import { searchMeals, suggestMeals, type SearchInput } from './suggest/suggest.ts'
import { checkAnswers, understand } from './understand/understand.ts'

type Event = APIGatewayProxyEventV2WithJWTAuthorizer
type Result = APIGatewayProxyStructuredResultV2

const PLANS_TABLE = process.env.PLANS_TABLE
// Each call costs Bedrock tokens; this caps what one user can spend in a day.
const UNDERSTAND_CALLS_PER_DAY = 20
const CHAT_MESSAGES_PER_DAY = 60
// After this many questions, code adds SUGGEST_NOW to the user's message, so the budget doesn't
// depend on the prompt.
const MAX_QUESTIONS = 4
const SUGGEST_NOW =
  'Note from the app: you have asked enough questions. Search and suggest meals now.'

export const handler = async (event: Event): Promise<Result> => {
  try {
    return await route(event)
  } catch (error) {
    console.error('request failed', event.routeKey, error)
    if (error instanceof Error && error.name === 'ThrottlingException') {
      return json(503, { message: 'The service is busy. Please try again in a moment.' })
    }
    return json(500, { message: 'Something went wrong' })
  }
}

function route(event: Event): Promise<Result> | Result {
  const userId = event.requestContext.authorizer.jwt.claims.sub
  // The authorizer always sets it; if it ever doesn't, refuse rather than share one plan between users.
  if (typeof userId !== 'string' || !userId) return json(401, { message: 'Not signed in' })

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
    case 'POST /plan/chat':
      return chatMessage(userId, event.body)
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

function noCatalog(error: unknown): Catalog {
  console.error('catalog failed, sending meals without names', error)
  return { ingredients: [], cuisines: [], ingredientById: new Map(), cuisineById: new Map() }
}

async function getCatalog() {
  const { ingredients, cuisines } = await loadCatalog()
  // Listed field by field, so a field added to the table isn't sent by accident.
  return json(200, {
    ingredients: ingredients.map(({ id, name, category, unit, emoji }) => ({
      id,
      name,
      category,
      unit,
      emoji,
    })),
    cuisines: cuisines.map(({ id, name }) => ({ id, name })),
  })
}

async function recipeFor(mealId: string | undefined) {
  if (typeof mealId !== 'string' || !MEAL_ID.test(mealId)) {
    return json(400, { message: 'Invalid meal id' })
  }

  const recipe = await getRecipe(mealId)
  return recipe ? json(200, recipe) : json(404, { message: 'Meal not found' })
}

async function getPlan(userId: string, weekStart: string | undefined) {
  if (!isIsoDate(weekStart)) return json(400, { message: 'week must look like 2026-09-28' })

  const { Item } = await db.send(
    new GetCommand({ TableName: PLANS_TABLE, Key: { userId, weekStart }, ConsistentRead: true }),
  )
  return json(200, { weekStart, slots: Item?.slots ?? {} })
}

// A Query returns at most 1 MB, so keep reading while DynamoDB says there's another page.
async function getPlanHistory(userId: string) {
  const plans: Plan[] = []
  let startKey: QueryCommandOutput['LastEvaluatedKey']
  do {
    const page: QueryCommandOutput = await db.send(
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
    plans.push(...((page.Items ?? []) as Plan[]))
    startKey = page.LastEvaluatedKey
  } while (startKey)

  return json(200, { plans: plans.filter(hasMeals) })
}

function hasMeals(plan: Plan) {
  return Object.keys(plan.slots ?? {}).length > 0
}

async function getSuggestions(userId: string, weekStart: string | undefined) {
  if (!isIsoDate(weekStart)) return json(400, { message: 'week must look like 2026-09-28' })

  const [{ Item }, meals] = await Promise.all([
    db.send(
      new GetCommand({ TableName: PLANS_TABLE, Key: { userId, weekStart }, ConsistentRead: true }),
    ),
    loadMeals(),
  ])
  // Answers saved before a field existed don't have it.
  const answers: PlanAnswers = { ...EMPTY_PLAN_ANSWERS, ...Item?.answers }
  return json(200, suggestMeals(meals, answers))
}

// UpdateCommand, not PutCommand: a Put would replace the whole item and delete the answers.
async function savePlan(userId: string, body: string | undefined) {
  const plan = parseJson(body)
  if (!isObject(plan) || !isIsoDate(plan.weekStart) || !isSlots(plan.slots)) {
    return json(400, { message: 'Invalid plan' })
  }

  await update(userId, plan.weekStart, 'slots', plan.slots)
  return json(200, { weekStart: plan.weekStart, slots: plan.slots })
}

async function saveAnswers(userId: string, body: string | undefined) {
  const request = parseJson(body)
  if (!isObject(request) || !isIsoDate(request.weekStart) || !isObject(request.answers)) {
    return json(400, { message: 'Invalid answers' })
  }

  const answers = await checkAnswers(request.answers)
  await update(userId, request.weekStart, 'answers', answers)
  return json(200, { weekStart: request.weekStart, answers })
}

/** Sets one field of a plan, creating the plan if it doesn't exist yet. */
function update(userId: string, weekStart: string, field: string, value: unknown) {
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

async function chatMessage(userId: string, body: string | undefined) {
  const request = parseJson(body)
  const message = stringField(request, 'message')?.trim()
  if (!message || message.length > 2000) {
    return json(400, { message: 'message must be 1 to 2000 characters' })
  }
  if (!(await claimDailyCall(userId, 'chat', CHAT_MESSAGES_PER_DAY))) {
    return json(429, { code: 'daily-limit', message: 'Daily limit reached' })
  }

  const chatId = stringField(request, 'chatId')
  const chat: Chat | undefined = chatId
    ? await getChat(userId, chatId)
    : { userId, chatId: randomUUID(), messages: [], questionsAsked: 0 }
  if (!chat) return json(404, { code: 'chat-not-found', message: 'This chat has expired' })

  const [meals, catalog] = await Promise.all([loadMeals(), loadCatalog()])
  const known = knownIdsFrom(catalog, meals)
  // The last cleaned search becomes the week's answers: exactly what the meals were found with.
  let search: SearchInput | undefined
  const runTool: RunTool = async (name, input) => {
    if (name === SEARCH_MEALS) {
      search = cleanSearchInput(input, known)
      return searchMeals(meals, search)
    }
    throw new Error(`Unknown tool: ${name}`)
  }

  chat.messages = await runTurn([...chat.messages, userMessage(message, chat.questionsAsked)], {
    callModel: bedrockModel(planPrompt(SEARCH_MEALS), [searchMealsTool(known)]),
    runTool,
  })

  if (search) chat.plan = planAnswersFrom(search)
  else chat.questionsAsked++
  await saveChat(chat)

  const plan = chat.plan && { answers: chat.plan, labels: labelsFor(chat.plan, catalog, meals) }
  return json(200, { chatId: chat.chatId, reply: textOf(chat.messages.at(-1)), plan })
}

function userMessage(text: string, questionsAsked: number): Message {
  const content = [{ text }]
  if (questionsAsked >= MAX_QUESTIONS) content.push({ text: SUGGEST_NOW })
  return { role: 'user', content }
}

function textOf(message: Message | undefined) {
  return message?.content?.map((block) => block.text ?? '').join('') ?? ''
}

async function understandText(userId: string, body: string | undefined) {
  const request = parseJson(body)
  const text = stringField(request, 'text')?.trim()
  if (!text || text.length > 2000) {
    return json(400, { message: 'text must be 1 to 2000 characters' })
  }
  if (!(await claimDailyCall(userId, 'understand', UNDERSTAND_CALLS_PER_DAY))) {
    return json(429, { code: 'daily-limit', message: 'Daily limit reached' })
  }

  const [answers, catalog, meals] = await Promise.all([
    understand(text),
    loadCatalog().catch(logMissingCatalog),
    loadMeals(),
  ])
  const labels = catalog ? labelsFor(answers, catalog, meals) : EMPTY_PLAN_ANSWER_LABELS
  return json(200, { ...answers, labels })
}

// The AI call is already paid for: send the answers without names rather than fail.
function logMissingCatalog(error: unknown) {
  console.error('catalog failed, answers sent without names', error)
  return null
}

const MEAL_ID = /^[a-z0-9-]{1,80}$/

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringField(value: unknown, key: string) {
  return isObject(value) && typeof value[key] === 'string' ? value[key] : undefined
}

function isSlots(value: unknown): value is PlanSlots {
  return (
    isObject(value) &&
    Object.entries(value).every(
      ([slotId, mealId]) => isSlotId(slotId) && typeof mealId === 'string' && MEAL_ID.test(mealId),
    )
  )
}

function parseJson(text: string | undefined): unknown {
  try {
    return JSON.parse(text ?? '')
  } catch {
    return null
  }
}

function json(statusCode: number, data: unknown): Result {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  }
}
