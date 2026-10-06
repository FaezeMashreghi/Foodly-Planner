export const queryKeys = {
  meals: ['meals'],
  plan: (weekStart: string) => ['plan', weekStart] as const,
  recipe: (mealId: string) => ['recipe', mealId] as const,
} as const
