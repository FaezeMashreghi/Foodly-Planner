import type { Construct } from 'constructs'
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib'
import {
  OidcProviderNative,
  OpenIdConnectPrincipal,
  PolicyStatement,
  Role,
} from 'aws-cdk-lib/aws-iam'

const GITHUB_REPO = 'FaezeMashreghi/Foodly-Planner'
// The token's `sub` names the owner and repo as name@id. The ids never change, so a repo deleted
// and created again under the same name can't use the role.
const GITHUB_REPO_WITH_IDS = 'FaezeMashreghi@148049552/Foodly-Planner@1382956632'
const GITHUB_ENVIRONMENT = 'production'
// Roles made by `cdk bootstrap` ("hnb659fds" is its default qualifier). No image publishing: no Docker.
const CDK_BOOTSTRAP_ROLES = ['deploy-role', 'file-publishing-role', 'lookup-role']

// Lets GitHub Actions sign in to AWS with short-lived tokens instead of stored keys.
export class GithubDeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const githubProvider = new OidcProviderNative(this, 'GithubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    })

    // Only jobs of this repo that run in the protected GitHub environment can take the role.
    const deployRole = new Role(this, 'GithubDeployRole', {
      description: `GitHub Actions deploys of ${GITHUB_REPO}`,
      assumedBy: new OpenIdConnectPrincipal(githubProvider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO_WITH_IDS}:environment:${GITHUB_ENVIRONMENT}`,
        },
      }),
    })

    // No direct permissions: `cdk deploy` works through the bootstrap roles.
    const bootstrapRoleArns = CDK_BOOTSTRAP_ROLES.map(
      (role) =>
        `arn:${this.partition}:iam::${this.account}:role/cdk-hnb659fds-${role}-${this.account}-${this.region}`,
    )
    deployRole.addToPolicy(
      new PolicyStatement({ actions: ['sts:AssumeRole'], resources: bootstrapRoleArns }),
    )

    new CfnOutput(this, 'DeployRoleArn', { value: deployRole.roleArn })
  }
}
