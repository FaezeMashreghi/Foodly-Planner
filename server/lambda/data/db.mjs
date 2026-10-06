import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// One client for the whole Lambda, created once per instance and reused by every call.
export const db = DynamoDBDocumentClient.from(new DynamoDBClient({}))
