export const AuthErrorName = {
  NotAuthorized: 'NotAuthorizedException',
  UserNotConfirmed: 'UserNotConfirmedException',
  UsernameExists: 'UsernameExistsException',
  InvalidPassword: 'InvalidPasswordException',
  CodeMismatch: 'CodeMismatchException',
  ExpiredCode: 'ExpiredCodeException',
  LimitExceeded: 'LimitExceededException',
  TooManyRequests: 'TooManyRequestsException',
  TooManyFailedAttempts: 'TooManyFailedAttemptsException',
} as const

export type AuthErrorName = (typeof AuthErrorName)[keyof typeof AuthErrorName]

const tooManyAttempts = 'Too many attempts. Please wait a few minutes and try again.'

const messages: Record<AuthErrorName, string> = {
  [AuthErrorName.NotAuthorized]: 'Incorrect email or password.',
  [AuthErrorName.UserNotConfirmed]: 'Please confirm your email first.',
  [AuthErrorName.UsernameExists]: 'An account with this email already exists.',
  [AuthErrorName.InvalidPassword]:
    'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a symbol.',
  [AuthErrorName.CodeMismatch]: 'That code is incorrect. Check the email and try again.',
  [AuthErrorName.ExpiredCode]: 'That code has expired. Request a new one.',
  [AuthErrorName.LimitExceeded]: tooManyAttempts,
  [AuthErrorName.TooManyRequests]: tooManyAttempts,
  [AuthErrorName.TooManyFailedAttempts]: tooManyAttempts,
}

const fallbackMessage = 'Something went wrong. Please try again.'

export function isAuthError(error: unknown, name: AuthErrorName): boolean {
  return error instanceof Error && error.name === name
}

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return fallbackMessage
  return messages[error.name as AuthErrorName] ?? fallbackMessage
}
