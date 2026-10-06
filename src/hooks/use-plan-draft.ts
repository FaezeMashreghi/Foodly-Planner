import { useState } from 'react'
import {
  loadPlanDraft,
  savePlanDraft,
  type PlanDraft,
} from '@/components/plan-questions/plan-questions-flow/plan-draft'

/** The flow's answers, loaded from the draft once and saved back on every update. */
export function usePlanDraft() {
  const [draft, setDraft] = useState(() => loadPlanDraft())

  // Saved at once, not in an effect: the next screen's route checks the draft before it opens.
  function updateDraft(changes: Partial<PlanDraft>) {
    const nextDraft = { ...draft, ...changes }
    setDraft(nextDraft)
    savePlanDraft(nextDraft)
  }

  return { ...draft, updateDraft }
}
