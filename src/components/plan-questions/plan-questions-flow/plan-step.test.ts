import { describe, expect, it } from 'vitest'
import { needsExtractedAnswers, parsePlanStep, questionIndexOf } from './plan-step'

describe('parsePlanStep', () => {
  it('accepts a question number, also written as text', () => {
    expect(parsePlanStep(1)).toBe(1)
    expect(parsePlanStep(4)).toBe(4)
    expect(parsePlanStep('2')).toBe(2)
  })

  it('accepts the review and start-day screens', () => {
    expect(parsePlanStep('review')).toBe('review')
    expect(parsePlanStep('start-day')).toBe('start-day')
  })

  it('rejects anything else', () => {
    expect(parsePlanStep(0)).toBeUndefined()
    expect(parsePlanStep(5)).toBeUndefined()
    expect(parsePlanStep(1.5)).toBeUndefined()
    expect(parsePlanStep('banana')).toBeUndefined()
    expect(parsePlanStep(undefined)).toBeUndefined()
  })
})

describe('questionIndexOf', () => {
  it('counts the questions from 0', () => {
    expect(questionIndexOf(1)).toBe(0)
    expect(questionIndexOf(4)).toBe(3)
  })

  it('is the first question for the other screens', () => {
    expect(questionIndexOf('review')).toBe(0)
  })
})

describe('needsExtractedAnswers', () => {
  it('is true only for the screens after the AI has read the answers', () => {
    expect(needsExtractedAnswers('review')).toBe(true)
    expect(needsExtractedAnswers('start-day')).toBe(true)
    expect(needsExtractedAnswers(4)).toBe(false)
    expect(needsExtractedAnswers(undefined)).toBe(false)
  })
})
