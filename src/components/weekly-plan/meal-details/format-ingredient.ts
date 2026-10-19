import type { Ingredient } from '@shared/meal/meal'

/** "300 g Beef stew meat", or "3 × Dried lime" for pieces. */
export function formatIngredient({ name, amount, unit }: Ingredient): string {
  return unit === 'piece' ? `${amount} × ${name}` : `${amount} ${unit} ${name}`
}
