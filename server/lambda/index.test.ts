import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import type { Plan } from '@shared/week-plan/week-plan'
import { handler } from './index.ts'

const send = vi.hoisted(() => vi.fn())
// Only db is faked; the module's helpers (isConditionFailed) stay real.
vi.mock('./data/db.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./data/db.ts')>()),
  db: { send },
}))

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
