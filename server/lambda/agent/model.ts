import { ConverseCommand, type Tool } from '@aws-sdk/client-bedrock-runtime'
import { bedrock, MODEL_ID } from '@server/lambda/data/bedrock.ts'
import type { CallModel } from './loop.ts'

export function bedrockModel(system: string, tools: Tool[]): CallModel {
  return async (messages) => {
    const response = await bedrock.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: system }, { cachePoint: { type: 'default' } }],
        messages,
        toolConfig: { tools },
        inferenceConfig: { maxTokens: 1024 },
      }),
    )
    console.log('bedrock usage', JSON.stringify(response.usage))
    return { message: response.output!.message!, stopReason: response.stopReason }
  }
}
