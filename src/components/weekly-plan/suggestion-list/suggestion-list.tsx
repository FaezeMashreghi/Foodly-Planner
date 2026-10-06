import { useState } from 'react'
import { MEAL_TYPES, type Meal, type MealType } from '@shared/meal/meal'
import type { PlanSuggestions } from '@shared/week-plan/week-plan'
import { Tabs, type Tab } from '@/components/ui/tabs/tabs'
import { DraggableMeal } from '@/components/weekly-plan/draggable-meal/draggable-meal'

const MEAL_TYPE_TABS: Tab<MealType>[] = MEAL_TYPES.map((mealType) => ({
  id: mealType,
  label: mealType,
}))

type SuggestionListProps = {
  suggestions: PlanSuggestions
  mealsById: ReadonlyMap<string, Meal>
  className?: string
}

export function SuggestionList({ suggestions, mealsById, className = '' }: SuggestionListProps) {
  const [mealType, setMealType] = useState<MealType>('Breakfast')
  const meals = suggestions[mealType].flatMap((id) => mealsById.get(id) ?? [])

  return (
    <aside
      aria-labelledby="suggestion-list-heading"
      className={`flex flex-col gap-3 overflow-y-auto card ${className}`}
    >
      <h2 id="suggestion-list-heading" className="text-heading">
        Suggestions
      </h2>
      <p className="text-sm text-ink-muted">Drag a meal onto a day.</p>
      <Tabs label="Meal type" tabs={MEAL_TYPE_TABS} selectedId={mealType} onSelect={setMealType}>
        <ul className="space-y-2">
          {meals.map((meal) => (
            <li key={meal.id}>
              <DraggableMeal meal={meal} />
            </li>
          ))}
        </ul>
      </Tabs>
    </aside>
  )
}
