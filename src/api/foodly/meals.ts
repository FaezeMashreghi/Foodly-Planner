import { queryOptions } from '@tanstack/react-query'
import type { Meal } from '@shared/meal/meal'
import { apiFetch } from './client'
import { queryKeys } from './query-keys'

export function fetchMeals() {
  return apiFetch<Meal[]>('/meals')
}

export const mealsQueryOptions = queryOptions({
  queryKey: queryKeys.meals,
  queryFn: fetchMeals,
  staleTime: 60 * 60 * 1000,
})
