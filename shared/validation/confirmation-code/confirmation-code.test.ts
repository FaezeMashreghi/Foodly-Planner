import { describe, expect, it } from 'vitest'
import { validateConfirmationCode } from './confirmation-code'

describe('validateConfirmationCode', () => {
  it.each([
    ['', 'Enter the confirmation code'],
    ['   ', 'Enter the confirmation code'],
    ['12345', 'Enter the 6-digit code from the email'],
    ['1234567', 'Enter the 6-digit code from the email'],
    ['12a456', 'Enter the 6-digit code from the email'],
    ['123456', undefined],
    ['012345', undefined],
    ['123 456', undefined],
    [' 123456 ', undefined],
  ])('validateConfirmationCode(%j) → %j', (input, expected) => {
    expect(validateConfirmationCode(input)).toBe(expected)
  })
})
