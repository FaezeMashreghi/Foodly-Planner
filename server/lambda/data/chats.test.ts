import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getChat, saveChat, type Chat } from './chats.ts'

const send = vi.hoisted(() => vi.fn())
vi.mock('./db.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./db.ts')>()),
  db: { send },
}))

const chat: Chat = {
  userId: 'user-1',
  chatId: 'chat-1',
  messages: [{ role: 'user', content: [{ text: 'busy week' }] }],
  questionsAsked: 1,
  version: 3,
}

beforeEach(() => {
  send.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getChat', () => {
  it("reads the chat by the user's id and the chat id", async () => {
    send.mockResolvedValue({ Item: chat })

    expect(await getChat('user-1', 'chat-1')).toEqual(chat)
    expect(send.mock.calls[0][0].input.Key).toEqual({ userId: 'user-1', chatId: 'chat-1' })
  })

  // DynamoDB deletes expired items in the background, often days later.
  it('returns nothing for a chat past its expiry that DynamoDB has not deleted yet', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'))
    send.mockResolvedValue({
      Item: { ...chat, expiresAt: Date.parse('2026-10-30T11:59:59Z') / 1000 },
    })

    expect(await getChat('user-1', 'chat-1')).toBeUndefined()
  })

  it('returns nothing when there is no such chat for this user', async () => {
    send.mockResolvedValue({})

    expect(await getChat('user-2', 'chat-1')).toBeUndefined()
  })
})

describe('saveChat', () => {
  it('saves the whole chat with the next version, deleted 7 days after this message', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-23T12:00:00Z'))
    send.mockResolvedValue({})

    expect(await saveChat(chat)).toBe(true)

    const sevenDaysLater = Date.parse('2026-10-30T12:00:00Z') / 1000
    expect(send.mock.calls[0][0].input.Item).toEqual({
      ...chat,
      version: 4,
      expiresAt: sevenDaysLater,
    })
  })

  it('only saves over the version it loaded, and says when another save got there first', async () => {
    send.mockRejectedValue(
      Object.assign(new Error('changed'), { name: 'ConditionalCheckFailedException' }),
    )

    expect(await saveChat(chat)).toBe(false)

    const { ConditionExpression, ExpressionAttributeValues } = send.mock.calls[0][0].input
    expect(ConditionExpression).toBe('attribute_not_exists(version) OR version = :loaded')
    expect(ExpressionAttributeValues).toEqual({ ':loaded': 3 })
  })
})
