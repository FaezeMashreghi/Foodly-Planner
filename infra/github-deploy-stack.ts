import type { Construct } from 'constructs'
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib'
import {
  OidcProviderNative,
  OpenIdConnectPrincipal,
  PolicyStatement,
  Role,
} from 'aws-cdk-lib/aws-iam'

const GITHUB_REPO = 'FaezeMashreghi/Foodly-Planner'
// GitHub's `sub` uses name@id, so a re-created repo with the same name can't use the role.
const GITHUB_REPO_WITH_IDS = 'FaezeMashreghi@148049552/Foodly-Planner@1382956632'
const GITHUB_ENVIRONMENT = 'production'
// Made by `cdk bootstrap`; no image-publishing role, since nothing uses Docker.
const CDK_BOOTSTRAP_ROLES = ['deploy-role', 'file-publishing-role', 'lookup-role']

export class GithubDeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const githubProvider = new OidcProviderNative(this, 'GithubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    })

    const deployRole = new Role(this, 'GithubDeployRole', {
      description: `GitHub Actions deploys of ${GITHUB_REPO}`,
      assumedBy: new OpenIdConnectPrincipal(githubProvider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO_WITH_IDS}:environment:${GITHUB_ENVIRONMENT}`,
        },
      }),
    })

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
