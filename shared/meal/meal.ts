export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const

export type MealType = (typeof MEAL_TYPES)[number]

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Unit = 'g' | 'ml' | 'piece'

export type Ingredient = {
  ingredientId: string
  amount: number
  unit: Unit
  /** Added by GET /meals, not stored on the meal. */
  name: string
  emoji?: string
}

export type Recipe = {
  /** Pantry items the steps use that aren't in the ingredients. */
  extras: string[]
  steps: string[]
  tips: string[]
  model: string
  createdAt: string
}

export type Meal = {
  id: string
  name: string
  emoji: string
  mealTypes: MealType[]
  cuisine: string
  /** Added by GET /meals, not stored on the meal. */
  cuisineName: string
  difficulty: Difficulty
  prepMinutes: number
  servings: number
  ingredients: Ingredient[]
}
