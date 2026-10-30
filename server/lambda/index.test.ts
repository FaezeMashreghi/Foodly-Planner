import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { EMPTY_PLAN_ANSWERS, type Plan } from '@shared/week-plan/week-plan'
import { handler } from './index.ts'

const send = vi.hoisted(() => vi.fn())
// Only db is faked; the module's helpers (isConditionFailed) stay real.
vi.mock('./data/db.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./data/db.ts')>()),
  db: { send },
}))

// The model is faked: the route's own logic (chats, limits, the question budget) is what's tested.
const callModel = vi.hoisted(() => vi.fn())
vi.mock('./agent/model.ts', () => ({ bedrockModel: () => callModel }))

function request(routeKey: string) {
  return {
    routeKey,
    requestContext: { authorizer: { jwt: { claims: { sub: 'user-1' } } } },
  } as unknown as APIGatewayProxyEventV2WithJWTAuthorizer
}

beforeEach(() => {
  send.mockReset()
})

describe('GET /plans', () => {
  it("asks DynamoDB for only this user's weeks, newest first, including a save just made", async () => {
    send.mockResolvedValue({ Items: [] })

    await handler(request('GET /plans'))

    const { KeyConditionExpression, ExpressionAttributeValues, ScanIndexForward, ConsistentRead } =
      send.mock.calls[0][0].input
    expect(KeyConditionExpression).toBe('userId = :userId')
    expect(ExpressionAttributeValues).toEqual({ ':userId': 'user-1' })
    expect(ScanIndexForward).toBe(false)
    expect(ConsistentRead).toBe(true)
  })

  it('leaves out weeks without meals and keeps the order', async () => {
    send.mockResolvedValue({
      Items: [
        { weekStart: '2026-10-05', slots: { 'Monday Dinner': 'menemen' } },
        { weekStart: '2026-09-28', slots: {} },
        { weekStart: '2026-09-21' },
        { weekStart: '2026-09-14', slots: { 'Friday Lunch': 'ghormeh-sabzi' } },
      ],
    })

    const response = await handler(request('GET /plans'))

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body ?? '').plans.map((plan: Plan) => plan.weekStart)).toEqual([
      '2026-10-05',
      '2026-09-14',
    ])
  })

  it('reads every page, so older weeks with meals still show', async () => {
    const bookmark = { userId: 'user-1', weekStart: '2026-09-28' }
    send
      .mockResolvedValueOnce({
        Items: [{ weekStart: '2026-09-28', slots: {} }],
        LastEvaluatedKey: bookmark,
      })
      .mockResolvedValueOnce({
        Items: [{ weekStart: '2026-09-21', slots: { 'Monday Dinner': 'menemen' } }],
      })

    const response = await handler(request('GET /plans'))

    expect(JSON.parse(response.body ?? '').plans.map((plan: Plan) => plan.weekStart)).toEqual([
      '2026-09-21',
    ])
    expect(send).toHaveBeenCalledTimes(2)
    expect(send.mock.calls[1][0].input.ExclusiveStartKey).toEqual(bookmark)
  })
})

describe('GET /catalog', () => {
  it('returns every ingredient and cuisine, without the table key', async () => {
    send.mockImplementation(({ input }) =>
      Promise.resolve({
        Items:
          input.ExpressionAttributeValues[':type'] === 'ingredient'
            ? [{ type: 'ingredient', id: 'tomato', name: 'Tomato', unit: 'g' }]
            : [{ type: 'cuisine', id: 'persian', name: 'Persian' }],
      }),
    )

    const response = await handler(request('GET /catalog'))

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body ?? '')).toEqual({
      ingredients: [{ id: 'tomato', name: 'Tomato', unit: 'g' }],
      cuisines: [{ id: 'persian', name: 'Persian' }],
    })
  })
})

describe('the signed-in user', () => {
  it('is refused when the token has no user id, instead of sharing one plan', async () => {
    const event = request('GET /plans')
    delete (event.requestContext.authorizer.jwt.claims as Record<string, unknown>).sub

    const response = await handler(event)

    expect(response.statusCode).toBe(401)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('GET /plan/suggestions', () => {
  it('works for answers saved before a field existed', async () => {
    send.mockImplementation((command) =>
      Promise.resolve(
        command instanceof GetCommand
          ? { Item: { answers: { expiring: ['spinach'] } } }
          : { Items: [{ id: 'porridge', mealTypes: ['Breakfast'], ingredients: [] }] },
      ),
    )

    const response = await handler({
      ...request('GET /plan/suggestions'),
      queryStringParameters: { week: '2026-10-19' },
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body ?? '').Breakfast).toEqual(['porridge'])
  })
})

describe('POST /plan/chat', () => {
  const userSays = (text: string) => ({ role: 'user', content: [{ text }] })
  const agentSays = (text: string) => ({ role: 'assistant', content: [{ text }] })
  const reply = (text: string) => ({ message: agentSays(text), stopReason: 'end_turn' })
  const searchCall = {
    message: {
      role: 'assistant',
      content: [
        { toolUse: { toolUseId: 't1', name: 'search_meals', input: { maxPrepMinutes: 30 } } },
      ],
    },
    stopReason: 'tool_use',
  }
  const existingChat = (questionsAsked: number) => ({
    userId: 'user-1',
    chatId: 'chat-1',
    messages: [userSays('plan my week'), agentSays('Any allergies?')],
    questionsAsked,
  })

  function chatRequest(body: object) {
    return { ...request('POST /plan/chat'), body: JSON.stringify(body) }
  }

  function fakeDb({ chat, overLimit = false }: { chat?: object; overLimit?: boolean } = {}) {
    send.mockImplementation((command) => {
      if (command instanceof GetCommand) return Promise.resolve(chat ? { Item: chat } : {})
      if (command instanceof UpdateCommand && overLimit) {
        return Promise.reject(
          Object.assign(new Error('limit'), { name: 'ConditionalCheckFailedException' }),
        )
      }
      if (command instanceof PutCommand || command instanceof UpdateCommand)
        return Promise.resolve({})
      return Promise.resolve({ Items: [] })
    })
  }

  const savedChat = () =>
    send.mock.calls.map(([command]) => command).find((command) => command instanceof PutCommand)
      ?.input.Item as Record<string, unknown>

  beforeEach(() => {
    callModel.mockReset()
  })

  it("starts a new chat, saves it under the user's id and returns the agent's reply", async () => {
    fakeDb()
    callModel.mockResolvedValue(reply('Any allergies?'))

    const response = await handler(chatRequest({ message: 'plan my week' }))

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body ?? '')
    expect(body.reply).toBe('Any allergies?')
    expect(body.plan).toBeUndefined()
    expect(savedChat()).toMatchObject({
      userId: 'user-1',
      chatId: body.chatId,
      messages: [userSays('plan my week'), agentSays('Any allergies?')],
      questionsAsked: 1,
    })
  })

  it("continues the user's chat: the model sees the history and the new message", async () => {
    fakeDb({ chat: existingChat(1) })
    callModel.mockResolvedValue(reply('How much time do you have?'))

    await handler(chatRequest({ chatId: 'chat-1', message: 'no allergies' }))

    const get = send.mock.calls.map(([command]) => command).find((c) => c instanceof GetCommand)
    expect(get?.input.Key).toEqual({ userId: 'user-1', chatId: 'chat-1' })
    expect(callModel.mock.calls[0][0].slice(0, 3)).toEqual([
      userSays('plan my week'),
      agentSays('Any allergies?'),
      userSays('no allergies'),
    ])
    expect(savedChat().questionsAsked).toBe(2)
  })

  it('after a search, returns and saves the answers it searched with, not counted as a question', async () => {
    fakeDb({ chat: existingChat(1) })
    callModel.mockResolvedValueOnce(searchCall).mockResolvedValueOnce(reply('Here are 3 meals'))

    const response = await handler(
      chatRequest({ chatId: 'chat-1', message: 'no allergies, I am busy' }),
    )

    const { plan } = JSON.parse(response.body ?? '')
    expect(plan.answers).toEqual({ ...EMPTY_PLAN_ANSWERS, maxPrepMinutes: 30 })
    expect(savedChat().plan).toEqual(plan.answers)
    expect(savedChat().questionsAsked).toBe(1)
  })

  it('keeps returning the last answers when the agent replies without searching', async () => {
    const plan = { ...EMPTY_PLAN_ANSWERS, maxPrepMinutes: 30 }
    fakeDb({ chat: { ...existingChat(1), plan } })
    callModel.mockResolvedValue(reply('Anything else?'))

    const response = await handler(chatRequest({ chatId: 'chat-1', message: 'thanks' }))

    expect(JSON.parse(response.body ?? '').plan.answers).toEqual(plan)
  })

  it('after 4 questions, tells the model to suggest meals now', async () => {
    fakeDb({ chat: existingChat(4) })
    callModel.mockResolvedValue(reply('Here are 3 meals'))

    await handler(chatRequest({ chatId: 'chat-1', message: 'something Persian' }))

    const newMessage = callModel.mock.calls[0][0][2]
    expect(newMessage.content[0]).toEqual({ text: 'something Persian' })
    expect(newMessage.content[1].text).toMatch(/suggest/i)
  })

  it("answers 404 for a chat that doesn't exist or has expired", async () => {
    fakeDb()

    const response = await handler(chatRequest({ chatId: 'chat-old', message: 'hi' }))

    expect(response.statusCode).toBe(404)
    expect(callModel).not.toHaveBeenCalled()
  })

  it('refuses an empty or too long message without calling the model', async () => {
    fakeDb()

    expect((await handler(chatRequest({ message: '  ' }))).statusCode).toBe(400)
    expect((await handler(chatRequest({ message: 'x'.repeat(2001) }))).statusCode).toBe(400)
    expect(callModel).not.toHaveBeenCalled()
  })

  it('refuses once the daily limit is reached, without calling the model', async () => {
    fakeDb({ overLimit: true })

    const response = await handler(chatRequest({ message: 'plan my week' }))

    expect(response.statusCode).toBe(429)
    expect(JSON.parse(response.body ?? '').code).toBe('daily-limit')
    expect(callModel).not.toHaveBeenCalled()
  })
})
