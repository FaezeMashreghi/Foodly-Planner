import { beforeEach, describe, expect, it, vi } from 'vitest'

const send = vi.fn()
vi.mock('./db.mjs', () => ({ db: { send } }))

// A fresh module for each test, so the cache from one test doesn't leak into the next.
async function importMeals() {
  vi.resetModules()
  return import('./meals.mjs')
}

beforeEach(() => {
  send.mockReset()
})

describe('loadMeals', () => {
  it('reads every page of the table', async () => {
    send
      .mockResolvedValueOnce({ Items: [{ id: 'a' }], LastEvaluatedKey: { id: 'a' } })
      .mockResolvedValueOnce({ Items: [{ id: 'b' }] })
    const { loadMeals } = await importMeals()

    expect(await loadMeals()).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(send.mock.calls[1][0].input.ExclusiveStartKey).toEqual({ id: 'a' })
  })

  it('leaves the recipe out of the read', async () => {
    send.mockResolvedValue({ Items: [] })
    const { loadMeals } = await importMeals()

    await loadMeals()

    const { ExpressionAttributeNames } = send.mock.calls[0][0].input
    expect(Object.values(ExpressionAttributeNames)).toContain('name')
    expect(Object.values(ExpressionAttributeNames)).not.toContain('recipe')
  })

  it('reads the table only once for many calls', async () => {
    send.mockResolvedValue({ Items: [{ id: 'a' }] })
    const { loadMeals } = await importMeals()

    await Promise.all([loadMeals(), loadMeals()])
    await loadMeals()

    expect(send).toHaveBeenCalledTimes(1)
  })

  it('tries again on the next call after a failed read', async () => {
    send.mockRejectedValueOnce(new Error('DynamoDB is down'))
    send.mockResolvedValueOnce({ Items: [{ id: 'a' }] })
    const { loadMeals } = await importMeals()

    await expect(loadMeals()).rejects.toThrow('DynamoDB is down')
    expect(await loadMeals()).toEqual([{ id: 'a' }])
  })
})
