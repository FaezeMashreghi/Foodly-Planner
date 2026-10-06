import type { PlanAnswers } from '@shared/week-plan/week-plan'
import type { PlanAnswersText } from '@/components/plan-questions/plan-wizard/questions'

/** The unfinished flow, kept for this tab so Back and a refresh don't lose the answers. */
export type PlanDraft = {
  typedAnswers: PlanAnswersText
  /** What the AI understood; null until it has read the answers. */
  extractedAnswers: PlanAnswers | null
}

const KEY = 'foodly:plan-questions-draft'
const EMPTY_DRAFT: PlanDraft = { typedAnswers: {}, extractedAnswers: null }

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Storage can be missing or blocked (private windows, tests in Node): then there is simply no draft.
export function loadPlanDraft(storage: Storage | undefined = globalThis.sessionStorage): PlanDraft {
  try {
    const draft: unknown = JSON.parse(storage?.getItem(KEY) ?? 'null')
    if (!isObject(draft) || !isObject(draft.typedAnswers)) return EMPTY_DRAFT
    return {
      typedAnswers: draft.typedAnswers as PlanAnswersText,
      extractedAnswers: isObject(draft.extractedAnswers)
        ? (draft.extractedAnswers as PlanAnswers)
        : null,
    }
  } catch {
    return EMPTY_DRAFT
  }
}

export function savePlanDraft(
  draft: PlanDraft,
  storage: Storage | undefined = globalThis.sessionStorage,
) {
  try {
    storage?.setItem(KEY, JSON.stringify(draft))
  } catch {
    // Not saved: the flow still works, only Back and refresh lose the answers.
  }
}

/** Forgets the draft, so a new plan starts with empty answers. */
export function clearPlanDraft(storage: Storage | undefined = globalThis.sessionStorage) {
  try {
    storage?.removeItem(KEY)
  } catch {
    // Nothing to clear when storage is blocked.
  }
}
