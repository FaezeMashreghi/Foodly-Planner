import { describe, expect, it } from 'vitest'
import { getPasswordChecks, validateCurrentPassword, validateNewPassword } from './password'

describe('validateNewPassword', () => {
  it('asks for a password when empty', () => {
    expect(validateNewPassword('')).toBe('Enter a password')
  })

  it('accepts a password that meets every rule', () => {
    expect(validateNewPassword('Gagaga1!')).toBeUndefined()
  })

  // A password that is perfect except for one thing, once per rule.
  it.each([
    ['Abc1!', 'Your password needs at least 8 characters'],
    ['ABCDEF1!', 'Your password needs a lowercase letter'],
    ['abcdef1!', 'Your password needs an uppercase letter'],
    ['Abcdefg!', 'Your password needs a number'],
    ['Abcdefg1', 'Your password needs a symbol'],
  ])('reports the one missing rule: %j', (input, expected) => {
    expect(validateNewPassword(input)).toBe(expected)
  })

  // The edge of the length rule: 7 characters fails, 8 passes.
  it.each([
    ['Abcde1!', 'Your password needs at least 8 characters'],
    ['Abcdef1!', undefined],
  ])('length boundary: %j', (input, expected) => {
    expect(validateNewPassword(input)).toBe(expected)
  })

  // Several rules missing: listed in a fixed order, joined with commas and "and".
  it.each([
    ['*gagagaga', 'Your password needs an uppercase letter and a number'],
    [
      '123',
      'Your password needs at least 8 characters, a lowercase letter, an uppercase letter and a symbol',
    ],
  ])('lists every missing rule: %j', (input, expected) => {
    expect(validateNewPassword(input)).toBe(expected)
  })

  // Cognito only counts these characters as symbols.
  it.each(['-', '_', '@', '#', '$', '.', '?', '~', '=', '+', '/', '\\'])(
    'counts %j as a symbol',
    (symbol) => {
      expect(validateNewPassword(`Abcdef1${symbol}`)).toBeUndefined()
    },
  )

  it('does not count characters Cognito does not accept as symbols', () => {
    expect(validateNewPassword('Abcdef1£')).toBe('Your password needs a symbol')
  })

  it.each([' Abcdef1!', 'Abcdef1! '])('rejects a space at the start or end: %j', (input) => {
    expect(validateNewPassword(input)).toBe("Your password can't start or end with a space")
  })
})

describe('getPasswordChecks', () => {
  it('lists every rule in order, with whether it is met', () => {
    expect(getPasswordChecks('Abc1')).toEqual([
      { id: 'length', label: 'At least 8 characters', met: false },
      { id: 'lowercase', label: 'A lowercase letter', met: true },
      { id: 'uppercase', label: 'An uppercase letter', met: true },
      { id: 'number', label: 'A number', met: true },
      { id: 'symbol', label: 'A symbol', met: false },
    ])
  })

  it('marks nothing as met for an empty password', () => {
    expect(getPasswordChecks('').every((check) => !check.met)).toBe(true)
  })
})

describe('validateCurrentPassword', () => {
  it('asks for the password when empty', () => {
    expect(validateCurrentPassword('')).toBe('Enter your password')
  })

  // Sign-in doesn't check the rules: an older password may not meet today's rules.
  it('accepts any non-empty password', () => {
    expect(validateCurrentPassword('short')).toBeUndefined()
  })
})
