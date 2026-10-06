import { formatIngredient, getIngredient } from '@shared/meal/ingredients'
import type { Meal } from '@shared/meal/meal'
import { MealCard } from '@/components/weekly-plan/meal-card/meal-card'
import { MealRecipe } from '@/components/weekly-plan/meal-recipe/meal-recipe'
import { getYoutubeSearchUrl } from '@/lib/youtube'

export function MealDetails({ meal }: { meal: Meal }) {
  return (
    <div className="space-y-4">
      <MealCard meal={meal} showMealTypes />

      <section aria-labelledby="meal-details-ingredients" className="space-y-2">
        <h3 id="meal-details-ingredients" className="font-semibold">
          Ingredients ({meal.servings} servings)
        </h3>
        <ul role="list" className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {meal.ingredients.map((item) => (
            <li key={item.ingredientId} className="flex items-center gap-2">
              <span aria-hidden="true" className="w-6 shrink-0 text-center text-ink-muted">
                {getIngredient(item.ingredientId)?.emoji ?? '•'}
              </span>
              {formatIngredient(item)}
            </li>
          ))}
        </ul>
      </section>

      <MealRecipe mealId={meal.id} />

      <a
        href={getYoutubeSearchUrl(`${meal.name} recipe`)}
        target="_blank"
        rel="noopener noreferrer"
        className="link"
      >
        Watch how to make it on YouTube <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  )
}
