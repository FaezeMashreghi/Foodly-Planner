import { beforeEach, describe, expect, it, vi } from 'vitest'
import { claimDailyCall } from './usage.mjs'

const send = vi.hoisted(() => vi.fn())
vi.mock('./db.mjs', () => ({ db: { send } }))

function conditionFailed() {
  const error = new Error('The conditional request failed')
  error.name = 'ConditionalCheckFailedException'
  return error
}

beforeEach(() => {
  send.mockReset()
})

describe('claimDailyCall', () => {
  it('counts the call for this user and today, and allows it', async () => {
    send.mockResolvedValue({})

    expect(await claimDailyCall('user-1', 'understand', 20)).toBe(true)

    const { Key, ExpressionAttributeNames, ExpressionAttributeValues } = send.mock.calls[0][0].input
    expect(Key).toEqual({ userId: 'user-1', day: new Date().toISOString().slice(0, 10) })
    expect(ExpressionAttributeNames['#feature']).toBe('understand')
    expect(ExpressionAttributeValues[':limit']).toBe(20)
  })

  it('refuses the call once the limit is reached', async () => {
    send.mockRejectedValue(conditionFailed())

    expect(await claimDailyCall('user-1', 'understand', 20)).toBe(false)
  })

  it('passes on other DynamoDB errors', async () => {
    send.mockRejectedValue(new Error('DynamoDB is down'))

    await expect(claimDailyCall('user-1', 'understand', 20)).rejects.toThrow('DynamoDB is down')
  })
})
