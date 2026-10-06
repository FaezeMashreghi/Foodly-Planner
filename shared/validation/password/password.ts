// These rules match the Cognito User Pool password policy. If the policy changes,
// change them here too, or users will pass our check and then fail Cognito's.

const MIN_LENGTH = 8

// The characters Cognito counts as symbols (special characters).
const SYMBOLS = '^$*.[]{}()?"!@#%&/\\,><\':;|_~`=+-'

const RULES = [
  {
    id: 'length',
    label: `At least ${MIN_LENGTH} characters`,
    needs: `at least ${MIN_LENGTH} characters`,
    test: (value: string) => value.length >= MIN_LENGTH,
  },
  {
    id: 'lowercase',
    label: 'A lowercase letter',
    needs: 'a lowercase letter',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'uppercase',
    label: 'An uppercase letter',
    needs: 'an uppercase letter',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'A number',
    needs: 'a number',
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'symbol',
    label: 'A symbol',
    needs: 'a symbol',
    test: (value: string) => [...value].some((char) => SYMBOLS.includes(char)),
  },
] as const

export type PasswordRuleId = (typeof RULES)[number]['id']

export type PasswordCheck = {
  id: PasswordRuleId
  label: string
  met: boolean
}

/** Every rule, in order, with whether the password meets it. For the live checklist. */
export function getPasswordChecks(value: string): PasswordCheck[] {
  return RULES.map((rule) => ({ id: rule.id, label: rule.label, met: rule.test(value) }))
}

/** For sign-up and reset: checks every rule. Returns an error message, or `undefined`. */
export function validateNewPassword(value: string): string | undefined {
  if (value === '') return 'Enter a password'
  if (value !== value.trim()) return "Your password can't start or end with a space"

  const missing = RULES.filter((rule) => !rule.test(value)).map((rule) => rule.needs)
  if (missing.length > 0) return `Your password needs ${joinWithAnd(missing)}`
  return undefined
}

/**
 * For sign-in: only checks that something was typed. The rules aren't checked,
 * because an older password may not meet today's rules; Cognito decides.
 */
export function validateCurrentPassword(value: string): string | undefined {
  if (value === '') return 'Enter your password'
  return undefined
}

/** ['a', 'b', 'c'] → 'a, b and c' */
function joinWithAnd(items: readonly string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}
