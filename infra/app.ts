import { App } from 'aws-cdk-lib'
import { FoodlyStack } from './foodly-stack.ts'
import { GithubDeployStack } from './github-deploy-stack.ts'

const app = new App()
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-2' }

new FoodlyStack(app, 'FoodlyStack', { env })
// Deployed once by hand; the pipeline deploys only FoodlyStack.
new GithubDeployStack(app, 'GithubDeployStack', { env })
