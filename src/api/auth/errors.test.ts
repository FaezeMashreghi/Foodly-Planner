import { describe, expect, it } from 'vitest'
import { AuthErrorName, getAuthErrorMessage, isAuthError } from './errors'

function cognitoError(name: string) {
  const error = new Error('from Cognito')
  error.name = name
  return error
}

describe('getAuthErrorMessage', () => {
  it('returns the message for a known Cognito error', () => {
    expect(getAuthErrorMessage(cognitoError(AuthErrorName.NotAuthorized))).toBe(
      'Incorrect email or password.',
    )
  })

  it('returns a general message for an unknown error', () => {
    expect(getAuthErrorMessage(cognitoError('SomethingNew'))).toBe(
      'Something went wrong. Please try again.',
    )
  })

  it('returns a general message for something that is not an Error', () => {
    expect(getAuthErrorMessage('oops')).toBe('Something went wrong. Please try again.')
  })
})

describe('isAuthError', () => {
  it('matches only the given error name', () => {
    const error = cognitoError(AuthErrorName.UserNotConfirmed)
    expect(isAuthError(error, AuthErrorName.UserNotConfirmed)).toBe(true)
    expect(isAuthError(error, AuthErrorName.NotAuthorized)).toBe(false)
  })
})
