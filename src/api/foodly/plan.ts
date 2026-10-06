import { queryOptions } from '@tanstack/react-query'
import type { Plan, PlanAnswers, PlanWithSuggestions } from '@shared/week-plan/week-plan'
import { apiFetch } from './client'
import { queryKeys } from './query-keys'

export function fetchWeekPlan(weekStart: string) {
  return apiFetch<PlanWithSuggestions>(`/plan?week=${encodeURIComponent(weekStart)}`)
}

export function savePlanSlots(plan: Plan) {
  return apiFetch<Plan>('/plan', { method: 'PUT', body: JSON.stringify(plan) })
}

/** Asks the AI to turn the user's own words into structured answers. */
export function extractPlanAnswers(text: string) {
  return apiFetch<PlanAnswers>('/plan/understand', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

/** Saves the answers on the plan; the backend scores the suggestions from them. */
export function savePlanAnswers(weekStart: string, answers: PlanAnswers) {
  return apiFetch<{ weekStart: string; answers: PlanAnswers }>('/plan/answers', {
    method: 'PUT',
    body: JSON.stringify({ weekStart, answers }),
  })
}

export function planQueryOptions(weekStart: string) {
  return queryOptions({
    queryKey: queryKeys.plan(weekStart),
    queryFn: () => fetchWeekPlan(weekStart),
  })
}
