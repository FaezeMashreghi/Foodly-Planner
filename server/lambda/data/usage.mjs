import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db } from './db.mjs'

const USAGE_TABLE = process.env.USAGE_TABLE
// DynamoDB deletes a day's counts on its own (TTL) once they can't be needed any more.
const KEEP_SECONDS = 2 * 24 * 60 * 60

/**
 * Counts one call to a paid feature for the user today (UTC). Returns false, without counting,
 * when they already made `limit` calls today. One atomic write, so parallel calls can't go over.
 */
export async function claimDailyCall(userId, feature, limit) {
  try {
    await db.send(
      new UpdateCommand({
        TableName: USAGE_TABLE,
        Key: { userId, day: new Date().toISOString().slice(0, 10) },
        UpdateExpression: 'ADD #feature :one SET expiresAt = if_not_exists(expiresAt, :expiresAt)',
        ConditionExpression: 'attribute_not_exists(#feature) OR #feature < :limit',
        ExpressionAttributeNames: { '#feature': feature },
        ExpressionAttributeValues: {
          ':one': 1,
          ':limit': limit,
          ':expiresAt': Math.floor(Date.now() / 1000) + KEEP_SECONDS,
        },
      }),
    )
    return true
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return false
    throw error
  }
}
