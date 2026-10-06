import { describe, expect, it } from 'vitest'
import { answersToText } from './questions'

describe('answersToText', () => {
  it('puts every answer on its own line, in question order, with its topic', () => {
    expect(answersToText({ mustHave: 'ghormeh sabzi', expiring: 'spinach' })).toBe(
      'Ingredients going off soon: spinach\nA dish I really want: ghormeh sabzi',
    )
  })

  it('leaves out empty answers', () => {
    expect(answersToText({ expiring: '  ', cravings: 'Persian' })).toBe('Food I feel like: Persian')
    expect(answersToText({})).toBe('')
  })
})
