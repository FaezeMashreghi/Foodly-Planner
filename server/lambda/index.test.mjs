import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handler } from './index.mjs'

const send = vi.hoisted(() => vi.fn())
vi.mock('./data/db.mjs', () => ({ db: { send } }))

function request(routeKey) {
  return { routeKey, requestContext: { authorizer: { jwt: { claims: { sub: 'user-1' } } } } }
}

beforeEach(() => {
  send.mockReset()
})

describe('GET /plans', () => {
  it("asks DynamoDB for only this user's weeks, newest first", async () => {
    send.mockResolvedValue({ Items: [] })

    await handler(request('GET /plans'))

    const { KeyConditionExpression, ExpressionAttributeValues, ScanIndexForward } =
      send.mock.calls[0][0].input
    expect(KeyConditionExpression).toBe('userId = :userId')
    expect(ExpressionAttributeValues).toEqual({ ':userId': 'user-1' })
    expect(ScanIndexForward).toBe(false)
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
    expect(JSON.parse(response.body).plans.map((plan) => plan.weekStart)).toEqual([
      '2026-10-05',
      '2026-09-14',
    ])
  })
})
