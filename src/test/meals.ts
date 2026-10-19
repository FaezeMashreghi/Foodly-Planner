import type { Meal } from '@shared/meal/meal'

export const porridge: Meal = {
  id: 'porridge',
  name: 'Porridge',
  emoji: '🥣',
  mealTypes: ['Breakfast'],
  cuisine: 'international',
  cuisineName: 'International (fast & healthy)',
  difficulty: 'easy',
  prepMinutes: 10,
  servings: 1,
  ingredients: [],
  source: 'seed',
}

export const omelette: Meal = { ...porridge, id: 'omelette', name: 'Omelette', emoji: '🍳' }
