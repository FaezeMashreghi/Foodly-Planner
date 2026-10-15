import type { Meal } from '@shared/meal/meal'
import { PillButton } from '@/components/ui/pill-button/pill-button'
import { MealCard } from '@/components/weekly-plan/meal-card/meal-card'
import { MealDetailsButton } from '@/components/weekly-plan/meal-details-button/meal-details-button'

type MealPickerProps = {
  meals: Meal[]
  onPick: (meal: Meal) => void
}

export function MealPicker({ meals, onPick }: MealPickerProps) {
  if (meals.length === 0) {
    return <p className="text-ink-muted">No suggestions yet.</p>
  }

  return (
    <ul className="space-y-2">
      {meals.map((meal) => (
        <li key={meal.id}>
          <MealCard
            meal={meal}
            showMealTypes
            action={
              <div className="flex flex-wrap justify-end">
                <MealDetailsButton meal={meal} />
                <PillButton variant="primary" hiddenText={meal.name} onClick={() => onPick(meal)}>
                  Choose
                </PillButton>
              </div>
            }
          />
        </li>
      ))}
    </ul>
  )
}
