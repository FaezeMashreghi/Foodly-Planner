import { describe, expect, it } from 'vitest'
import { validateEmail } from './email'

describe('validateEmail', () => {
  it.each([
    // [input, expected result]
    ['', 'Enter your email address'],
    ['   ', 'Enter your email address'],
    ['faeze', 'Enter an email address in the correct format, like name@example.com'],
    ['faeze@', 'Enter an email address in the correct format, like name@example.com'],
    ['faeze@example', 'Enter an email address in the correct format, like name@example.com'],
    [
      'faeze example@example.com',
      'Enter an email address in the correct format, like name@example.com',
    ],
    ['faeze@example.com', undefined],
    ['  faeze@example.com  ', undefined], // spaces around are ignored (phones add them)
    ['faeze.m+food@mail.example.co.uk', undefined],
  ])('validateEmail(%j) → %j', (input, expected) => {
    expect(validateEmail(input)).toBe(expected)
  })
})
