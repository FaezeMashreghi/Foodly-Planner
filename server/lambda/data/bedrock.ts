import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'

export const bedrock = new BedrockRuntimeClient({})

export const MODEL_ID = process.env.MODEL_ID ?? 'eu.anthropic.claude-haiku-4-5-20251001-v1:0'
