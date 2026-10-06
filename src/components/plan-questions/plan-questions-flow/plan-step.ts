import { PLAN_QUESTIONS } from '@/components/plan-questions/plan-wizard/questions'

export type PlanStep = number | 'review' | 'start-day'

export function parsePlanStep(value: unknown): PlanStep | undefined {
  if (value === 'review' || value === 'start-day') return value
  const number = Number(value)
  if (Number.isInteger(number) && number >= 1 && number <= PLAN_QUESTIONS.length) return number
  return undefined
}

export function questionIndexOf(step: PlanStep): number {
  return typeof step === 'number' ? step - 1 : 0
}

export function needsExtractedAnswers(step: PlanStep | undefined): boolean {
  return step === 'review' || step === 'start-day'
}
