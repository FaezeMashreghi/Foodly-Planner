export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const

export type MealType = (typeof MEAL_TYPES)[number]

export const DISH_STYLES = [
  'stew',
  'rice-dish',
  'soup',
  'salad',
  'wrap-sandwich',
  'pasta-noodles',
  'grill',
  'breakfast-style',
  'egg-dish',
  'patties',
  'stuffed',
  'flatbread-pizza',
  'oven-bake',
] as const

export type DishStyle = (typeof DISH_STYLES)[number]

export const ALLERGENS = [
  'gluten',
  'dairy',
  'nuts',
  'egg',
  'fish',
  'shellfish',
  'soy',
  'sesame',
] as const

export type Allergen = (typeof ALLERGENS)[number]

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
  /** Hands-on time; missing on meals not tagged yet. */
  activeMinutes?: number
  dishStyles?: DishStyle[]
  servings: number
  ingredients: Ingredient[]
}
