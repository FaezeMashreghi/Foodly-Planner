import { App } from 'aws-cdk-lib'
import { FoodlyStack } from './foodly-stack.ts'

const app = new App()

new FoodlyStack(app, 'FoodlyStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-2' },
})
