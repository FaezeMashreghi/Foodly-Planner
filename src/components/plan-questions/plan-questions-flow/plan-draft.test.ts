import { describe, expect, it } from 'vitest'
import type { PlanAnswers } from '@shared/week-plan/week-plan'
import { clearPlanDraft, loadPlanDraft, savePlanDraft } from './plan-draft'

function fakeStorage(): Storage {
  const items = new Map<string, string>()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear(),
    key: () => null,
    get length() {
      return items.size
    },
  }
}

const extractedAnswers = { expiring: ['spinach'], notes: [] } as unknown as PlanAnswers

describe('plan draft', () => {
  it('loads what was saved', () => {
    const storage = fakeStorage()
    savePlanDraft({ typedAnswers: { expiring: 'Spinach' }, extractedAnswers }, storage)

    expect(loadPlanDraft(storage)).toEqual({
      typedAnswers: { expiring: 'Spinach' },
      extractedAnswers,
    })
  })

  it('is empty after it was cleared', () => {
    const storage = fakeStorage()
    savePlanDraft({ typedAnswers: { expiring: 'Spinach' }, extractedAnswers }, storage)
    clearPlanDraft(storage)

    expect(loadPlanDraft(storage)).toEqual({ typedAnswers: {}, extractedAnswers: null })
  })

  it('is empty when nothing was saved', () => {
    expect(loadPlanDraft(fakeStorage())).toEqual({ typedAnswers: {}, extractedAnswers: null })
  })

  it('is empty when the saved text is broken', () => {
    const storage = fakeStorage()
    storage.setItem('foodly:plan-questions-draft', '{not json')

    expect(loadPlanDraft(storage)).toEqual({ typedAnswers: {}, extractedAnswers: null })
  })

  it('works without storage', () => {
    expect(() =>
      savePlanDraft({ typedAnswers: {}, extractedAnswers: null }, undefined),
    ).not.toThrow()
    expect(() => clearPlanDraft(undefined)).not.toThrow()
    expect(loadPlanDraft(undefined)).toEqual({ typedAnswers: {}, extractedAnswers: null })
  })

  it('works when storage throws, e.g. when it is full or blocked', () => {
    const storage = fakeStorage()
    storage.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    storage.getItem = () => {
      throw new Error('SecurityError')
    }

    expect(() => savePlanDraft({ typedAnswers: {}, extractedAnswers: null }, storage)).not.toThrow()
    expect(loadPlanDraft(storage)).toEqual({ typedAnswers: {}, extractedAnswers: null })
  })
})
