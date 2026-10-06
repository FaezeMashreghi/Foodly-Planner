const EMPTY_MESSAGE = 'Enter your email address'
const FORMAT_MESSAGE = 'Enter an email address in the correct format, like name@example.com'

// Something @ something . something, with no spaces or extra @.
// Deliberately simple: the confirmation code is the real check that the email works.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns an error message, or `undefined` if the email is valid. */
export function validateEmail(value: string): string | undefined {
  const email = value.trim()

  if (email === '') return EMPTY_MESSAGE
  if (!EMAIL_PATTERN.test(email)) return FORMAT_MESSAGE
  return undefined
}
