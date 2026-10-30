import { describe, expect, it, vi } from 'vitest'
import type { ContentBlock, Message } from '@aws-sdk/client-bedrock-runtime'
import { runTurn, type CallModel, type Json, type ModelReply } from './loop.ts'

const userSays = (text: string): Message => ({ role: 'user', content: [{ text }] })

const answer = (text: string): ModelReply => ({
  message: { role: 'assistant', content: [{ text }] },
  stopReason: 'end_turn',
})

const askTools = (...calls: { id: string; name: string; input: Json }[]): ModelReply => ({
  message: {
    role: 'assistant',
    content: calls.map(({ id, name, input }): ContentBlock => ({
      toolUse: { toolUseId: id, name, input },
    })),
  },
  stopReason: 'tool_use',
})

/** A fake model that gives these replies in order. */
function modelReplying(...replies: ModelReply[]) {
  const callModel = vi.fn<CallModel>()
  for (const reply of replies) callModel.mockResolvedValueOnce(reply)
  return callModel
}

describe('runTurn', () => {
  it('returns the model reply when no tool is needed', async () => {
    const callModel = modelReplying(answer('Any allergies in the family?'))
    const runTool = vi.fn()

    const messages = await runTurn([userSays('busy week')], { callModel, runTool })

    expect(messages).toEqual([
      userSays('busy week'),
      { role: 'assistant', content: [{ text: 'Any allergies in the family?' }] },
    ])
    expect(callModel).toHaveBeenCalledTimes(1)
    expect(runTool).not.toHaveBeenCalled()
  })

  it('runs a tool the model asks for, sends back the result, then returns the answer', async () => {
    const callModel = modelReplying(
      askTools({ id: 't1', name: 'search_meals', input: { cuisines: ['persian'] } }),
      answer('How about ghormeh sabzi?'),
    )
    const runTool = vi.fn().mockResolvedValue({ meals: [{ id: 'ghormeh-sabzi' }] })

    const messages = await runTurn([userSays('something Persian')], { callModel, runTool })

    expect(runTool).toHaveBeenCalledWith('search_meals', { cuisines: ['persian'] })
    expect(messages).toEqual([
      userSays('something Persian'),
      askTools({ id: 't1', name: 'search_meals', input: { cuisines: ['persian'] } }).message,
      {
        role: 'user',
        content: [
          {
            toolResult: {
              toolUseId: 't1',
              content: [{ json: { meals: [{ id: 'ghormeh-sabzi' }] } }],
            },
          },
        ],
      },
      { role: 'assistant', content: [{ text: 'How about ghormeh sabzi?' }] },
    ])
  })

  it('runs every tool of one reply and sends all results back in one message, in order', async () => {
    const callModel = modelReplying(
      askTools(
        { id: 't1', name: 'search_meals', input: {} },
        { id: 't2', name: 'get_meal_details', input: { ids: ['adasi'] } },
      ),
      answer('Done'),
    )
    const runTool = vi.fn(async (name: string) => ({ from: name }))

    const messages = await runTurn([userSays('hi')], { callModel, runTool })

    expect(messages[2]).toEqual({
      role: 'user',
      content: [
        { toolResult: { toolUseId: 't1', content: [{ json: { from: 'search_meals' } }] } },
        { toolResult: { toolUseId: 't2', content: [{ json: { from: 'get_meal_details' } }] } },
      ],
    })
  })

  it('tells the model when a tool fails, so it can try something else', async () => {
    const callModel = modelReplying(
      askTools({ id: 't1', name: 'search_meals', input: {} }),
      answer('Sorry, let me ask differently.'),
    )
    const runTool = vi.fn().mockRejectedValue(new Error('unknown cuisine "italian"'))

    const messages = await runTurn([userSays('hi')], { callModel, runTool })

    expect(messages[2]).toEqual({
      role: 'user',
      content: [
        {
          toolResult: {
            toolUseId: 't1',
            content: [{ text: 'unknown cuisine "italian"' }],
            status: 'error',
          },
        },
      ],
    })
    expect(messages.at(-1)).toEqual({
      role: 'assistant',
      content: [{ text: 'Sorry, let me ask differently.' }],
    })
  })

  it('answers a tool call cut off by max_tokens with an error, without running it', async () => {
    const cutOff: ModelReply = {
      ...askTools({ id: 't1', name: 'search_meals', input: { cuisines: ['pers'] } }),
      stopReason: 'max_tokens',
    }
    const callModel = modelReplying(cutOff, answer('How about adasi?'))
    const runTool = vi.fn()

    const messages = await runTurn([userSays('something Persian')], { callModel, runTool })

    expect(runTool).not.toHaveBeenCalled()
    expect(messages[2]).toEqual({
      role: 'user',
      content: [
        {
          toolResult: {
            toolUseId: 't1',
            content: [{ text: expect.stringContaining('cut off') }],
            status: 'error',
          },
        },
      ],
    })
    expect(messages.at(-1)).toEqual(answer('How about adasi?').message)
  })

  it('stops after maxSteps model calls, so a confused model cannot loop forever', async () => {
    const callModel = vi
      .fn<CallModel>()
      .mockResolvedValue(askTools({ id: 't1', name: 'search_meals', input: {} }))
    const runTool = vi.fn().mockResolvedValue({ meals: [] })

    await expect(runTurn([userSays('hi')], { callModel, runTool, maxSteps: 3 })).rejects.toThrow(
      'step limit',
    )
    expect(callModel).toHaveBeenCalledTimes(3)
  })
})
