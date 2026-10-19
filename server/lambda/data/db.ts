import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// One client for the whole Lambda, created once per instance and reused by every call.
export const db = DynamoDBDocumentClient.from(new DynamoDBClient({}))

/** A write's ConditionExpression didn't hold, e.g. the item already exists. */
export function isConditionFailed(error: unknown) {
  return error instanceof Error && error.name === 'ConditionalCheckFailedException'
}
