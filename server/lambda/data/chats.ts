import type { Message } from '@aws-sdk/client-bedrock-runtime'
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { PlanAnswers } from '@shared/week-plan/week-plan'
import { db } from './db.ts'

const CHATS_TABLE = process.env.CHATS_TABLE ?? 'foodly-chats'
const KEEP_SECONDS = 7 * 24 * 60 * 60

export type Chat = {
  userId: string
  chatId: string
  messages: Message[]
  questionsAsked: number
  plan?: PlanAnswers
}


export async function getChat(userId: string, chatId: string) {
  const { Item } = await db.send(
    new GetCommand({ TableName: CHATS_TABLE, Key: { userId, chatId } }),
  )
  return Item as Chat | undefined
}


export async function saveChat(chat: Chat) {
  await db.send(
    new PutCommand({
      TableName: CHATS_TABLE,
      Item: { ...chat, expiresAt: Math.floor(Date.now() / 1000) + KEEP_SECONDS },
    }),
  )
}
