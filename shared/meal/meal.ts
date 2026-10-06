import type { CuisineId } from '@shared/meal/cuisines'
import type { IngredientId, Unit } from '@shared/meal/ingredients'

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const

export type MealType = (typeof MEAL_TYPES)[number]

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Ingredient = {
  ingredientId: IngredientId
  amount: number
  unit: Unit
}

/** Written by AI once per meal and saved on it (decision 19). */
export type Recipe = {
  /** Spices, herbs and pantry items the steps use that aren't in the meal's ingredients. */
  extras: string[]
  steps: string[]
  tips: string[]
  model: string
  createdAt: string
}

export type Meal = {
  /** Readable and stable, e.g. "spaghetti-bolognese". Stored as `_id` in MongoDB. */
  id: string
  name: string
  /** Shown instead of a photo for now. */
  emoji: string
  mealTypes: MealType[]
  cuisine: CuisineId
  difficulty: Difficulty
  prepMinutes: number
  servings: number
  ingredients: Ingredient[]
  /** S3 key of the photo; meals show an emoji until photos exist. */
  image?: string
  /** "seed": the reviewed starting catalogue; "ai": created later on request. */
  source: 'seed' | 'ai'
}
