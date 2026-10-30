import type {
  ContentBlock,
  Message,
  StopReason,
  ToolUseBlock,
} from '@aws-sdk/client-bedrock-runtime'

export type Json = NonNullable<ToolUseBlock['input']>
export type JsonObject = { [key: string]: Json }

export type ModelReply = { message: Message; stopReason: StopReason | undefined }
export type CallModel = (messages: Message[]) => Promise<ModelReply>
export type RunTool = (name: string, input: Json) => Promise<JsonObject>

const CUT_OFF_MESSAGE = 'Your reply was cut off before this tool call finished. Call it again.'

export async function runTurn(
  history: Message[],
  {
    callModel,
    runTool,
    maxSteps = 5,
  }: { callModel: CallModel; runTool: RunTool; maxSteps?: number },
): Promise<Message[]> {
  const messages = [...history]

  for (let step = 0; step < maxSteps; step++) {
    const reply = await callModel(messages)
    messages.push(reply.message)

    const toolUses =
      reply.message.content?.flatMap((block) => (block.toolUse ? [block.toolUse] : [])) ?? []
    if (!toolUses.length) return messages

    // Every toolUse needs a toolResult, or Bedrock rejects the next call. A reply cut off
    // (e.g. max_tokens) may hold half-written input, so it isn't run.
    const cutOff = reply.stopReason !== 'tool_use'
    const results = await Promise.all(
      toolUses.map((toolUse) =>
        cutOff ? errorResult(toolUse, CUT_OFF_MESSAGE) : runToolUse(toolUse, runTool),
      ),
    )
    messages.push({ role: 'user', content: results })
  }
  throw new Error('agent step limit reached')
}

async function runToolUse(toolUse: ToolUseBlock, runTool: RunTool): Promise<ContentBlock> {
  try {
    const result = await runTool(toolUse.name!, toolUse.input!)
    return { toolResult: { toolUseId: toolUse.toolUseId!, content: [{ json: result }] } }
  } catch (error) {
    return errorResult(toolUse, error instanceof Error ? error.message : String(error))
  }
}

function errorResult(toolUse: ToolUseBlock, text: string): ContentBlock {
  return { toolResult: { toolUseId: toolUse.toolUseId!, content: [{ text }], status: 'error' } }
}
