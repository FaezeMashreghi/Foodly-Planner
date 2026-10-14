import path from 'node:path'
import type { Construct } from 'constructs'
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { CfnStage, CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'

// Created in the console (decision 9) and kept there: the stack only refers to it.
const USER_POOL_ID = 'eu-west-2_C1b9UGOcy'
const USER_POOL_CLIENT_ID = '433ii8tl6051h4qs9ko08f26st'
const HAIKU_MODEL = 'anthropic.claude-haiku-4-5-20251001-v1:0'
const ALLOWED_ORIGINS = ['http://localhost:5173', 'https://main.d1wh7bghb5zvxn.amplifyapp.com']

export class FoodlyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const plansTable = new Table(this, 'PlansTable', {
      tableName: 'foodly-plans',
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      sortKey: { name: 'weekStart', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    })

    const mealsTable = new Table(this, 'MealsTable', {
      tableName: 'foodly-meals',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    })

    // AI calls per user per day. Only short-lived counts, so it can go with the stack.
    const usageTable = new Table(this, 'UsageTable', {
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      sortKey: { name: 'day', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiresAt',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const backend = new NodejsFunction(this, 'Backend', {
      entry: path.join(import.meta.dirname, '../server/lambda/index.mjs'),
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      memorySize: 256,
      // The AI routes wait for Bedrock.
      timeout: Duration.seconds(20),
      environment: {
        PLANS_TABLE: plansTable.tableName,
        MEALS_TABLE: mealsTable.tableName,
        USAGE_TABLE: usageTable.tableName,
        MODEL_ID: `eu.${HAIKU_MODEL}`,
      },
      bundling: { format: OutputFormat.ESM, target: 'node22' },
      logGroup: new LogGroup(this, 'BackendLogs', {
        retention: RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    })

    plansTable.grant(backend, 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:UpdateItem')
    mealsTable.grant(backend, 'dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem')
    usageTable.grant(backend, 'dynamodb:UpdateItem')
    // The "eu." inference profile sends each call to one of the EU regions.
    backend.addToRolePolicy(
      new PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: [
          `arn:aws:bedrock:${this.region}:${this.account}:inference-profile/eu.${HAIKU_MODEL}`,
          `arn:aws:bedrock:eu-*::foundation-model/${HAIKU_MODEL}`,
        ],
      }),
    )

    const api = new HttpApi(this, 'Api', {
      apiName: 'foodly-api-cdk',
      corsPreflight: {
        allowOrigins: ALLOWED_ORIGINS,
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT],
        allowHeaders: ['authorization', 'content-type'],
        maxAge: Duration.days(1),
      },
      defaultAuthorizer: new HttpJwtAuthorizer(
        'CognitoAuthorizer',
        `https://cognito-idp.${this.region}.amazonaws.com/${USER_POOL_ID}`,
        { jwtAudience: [USER_POOL_CLIENT_ID] },
      ),
    })

    const integration = new HttpLambdaIntegration('BackendIntegration', backend)
    const routes: [HttpMethod, string][] = [
      [HttpMethod.GET, '/meals'],
      [HttpMethod.POST, '/meals/{id}/recipe'],
      [HttpMethod.GET, '/plan'],
      [HttpMethod.PUT, '/plan'],
      [HttpMethod.GET, '/plan/suggestions'],
      [HttpMethod.PUT, '/plan/answers'],
      [HttpMethod.POST, '/plan/understand'],
      [HttpMethod.GET, '/plans'],
    ]
    const httpRoutes = routes.flatMap(([method, routePath]) =>
      api.addRoutes({ path: routePath, methods: [method], integration }),
    )

    // Limits for the whole API (all users together), in requests per second. They stop floods and
    // runaway loops; they don't cap one user's AI spend. The AI routes get lower limits.
    const stage = api.defaultStage!.node.defaultChild as CfnStage
    stage.defaultRouteSettings = { throttlingRateLimit: 20, throttlingBurstLimit: 40 }
    // Plain JSON passed to CloudFormation as is, so the keys use its PascalCase names.
    stage.routeSettings = {
      'POST /plan/understand': { ThrottlingRateLimit: 1, ThrottlingBurstLimit: 5 },
      'POST /meals/{id}/recipe': { ThrottlingRateLimit: 2, ThrottlingBurstLimit: 5 },
    }
    // The stage can only name routes that already exist.
    stage.node.addDependency(...httpRoutes)

    new CfnOutput(this, 'ApiUrl', { value: api.apiEndpoint })
  }
}
