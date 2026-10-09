export const queryKeys = {
  meals: ['meals'],
  plan: (weekStart: string) => ['plan', weekStart] as const,
  planHistory: ['plan-history'],
  planSuggestions: (weekStart: string) => ['plan-suggestions', weekStart] as const,
  recipe: (mealId: string) => ['recipe', mealId] as const,
} as const
