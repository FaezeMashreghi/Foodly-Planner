import { queryOptions } from '@tanstack/react-query'
import type { Recipe } from '@shared/meal/meal'
import { apiFetch } from './client'
import { queryKeys } from './query-keys'

/** The meal's saved recipe; the first request for a meal asks the AI to write it. */
export function fetchOrGenerateRecipe(mealId: string) {
  return apiFetch<Recipe>(`/meals/${encodeURIComponent(mealId)}/recipe`, { method: 'POST' })
}

export function recipeQueryOptions(mealId: string) {
  return queryOptions({
    queryKey: queryKeys.recipe(mealId),
    queryFn: () => fetchOrGenerateRecipe(mealId),
    staleTime: Infinity,
    retry: 1,
  })
}
