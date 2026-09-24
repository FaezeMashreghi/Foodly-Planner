// Thin wrappers around the Cognito API. Each function sends one request
// and returns plain data. Storing and refreshing tokens is the token
// manager's job, not this file's.

import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  RevokeTokenCommand,
  SignUpCommand,
  type AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider'

const region = import.meta.env.VITE_AWS_REGION
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID

if (!region || !clientId) {
  throw new Error(
    'Missing Cognito settings. Add VITE_AWS_REGION and VITE_COGNITO_CLIENT_ID to .env.local, then restart the dev server.',
  )
}

const client = new CognitoIdentityProviderClient({ region })

export type AuthTokens = {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresAt: number
}

export async function signUp(email: string, password: string) {
  const result = await client.send(
    new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: email }],
    }),
  )
  return { userConfirmed: result.UserConfirmed ?? false }
}

export async function confirmSignUp(email: string, code: string) {
  await client.send(
    new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
    }),
  )
}

export async function resendConfirmationCode(email: string) {
  await client.send(new ResendConfirmationCodeCommand({ ClientId: clientId, Username: email }))
}

export async function signIn(email: string, password: string): Promise<AuthTokens> {
  const result = await client.send(
    new InitiateAuthCommand({
      ClientId: clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }),
  )

  if (result.ChallengeName) {
    throw new Error(`Sign-in needs an extra step we don't support yet: ${result.ChallengeName}`)
  }

  return toTokens(result.AuthenticationResult)
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const result = await client.send(
    new InitiateAuthCommand({
      ClientId: clientId,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: refreshToken },
    }),
  )

  return toTokens(result.AuthenticationResult, refreshToken)
}

export async function forgotPassword(email: string) {
  await client.send(new ForgotPasswordCommand({ ClientId: clientId, Username: email }))
}

export async function confirmForgotPassword(email: string, code: string, newPassword: string) {
  await client.send(
    new ConfirmForgotPasswordCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    }),
  )
}

export async function signOut(refreshToken: string) {
  await client.send(new RevokeTokenCommand({ ClientId: clientId, Token: refreshToken }))
}

function toTokens(
  result: AuthenticationResultType | undefined,
  fallbackRefreshToken?: string,
): AuthTokens {
  const refreshToken = result?.RefreshToken ?? fallbackRefreshToken

  if (!result?.AccessToken || !result.IdToken || !refreshToken || !result.ExpiresIn) {
    throw new Error('Cognito did not return the expected tokens.')
  }

  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken,
    expiresAt: Date.now() + result.ExpiresIn * 1000,
  }
}
