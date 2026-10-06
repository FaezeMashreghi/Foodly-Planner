import { queryOptions } from '@tanstack/react-query'
import type { Plan, PlanAnswers, PlanSuggestions } from '@shared/week-plan/week-plan'
import { apiFetch } from './client'
import { queryKeys } from './query-keys'

export function fetchWeekPlan(weekStart: string) {
  return apiFetch<Plan>(`/plan?week=${encodeURIComponent(weekStart)}`)
}

/** Meal ids per meal type, best first, scored by the backend from the saved answers. */
export function fetchPlanSuggestions(weekStart: string) {
  return apiFetch<PlanSuggestions>(`/plan/suggestions?week=${encodeURIComponent(weekStart)}`)
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

/** Suggestions change only when the answers are saved, which invalidates this query. */
export function planSuggestionsQueryOptions(weekStart: string) {
  return queryOptions({
    queryKey: queryKeys.planSuggestions(weekStart),
    queryFn: () => fetchPlanSuggestions(weekStart),
    staleTime: Infinity,
  })
}
