import { useId, useState } from 'react'
import { MEAL_TYPES, type MealType } from '@shared/meal/meal'
import { Tabs, type Tab } from '@/components/ui/tabs/tabs'
import { DraggableMeal } from '@/components/weekly-plan/draggable-meal/draggable-meal'
import { UnavailableSuggestions } from '@/components/weekly-plan/unavailable-suggestions/unavailable-suggestions'
import type { SuggestionsState } from '@/components/weekly-plan/week-view'

const MEAL_TYPE_TABS: Tab<MealType>[] = MEAL_TYPES.map((mealType) => ({
  id: mealType,
  label: mealType,
}))

type SuggestionListProps = {
  suggestions: SuggestionsState
  className?: string
}

/** The suggestion column: the same frame while loading, after a failure, and with meals. */
export function SuggestionList({ suggestions, className = '' }: SuggestionListProps) {
  const [mealType, setMealType] = useState<MealType>('Breakfast')
  const headingId = useId()

  return (
    <aside
      aria-labelledby={headingId}
      className={`flex flex-col gap-3 overflow-y-auto card ${className}`}
    >
      <h2 id={headingId} className="text-heading">
        Suggestions
      </h2>
      {suggestions.status === 'success' ? (
        <>
          <p className="text-sm text-ink-muted">Drag a meal onto a day.</p>
          <Tabs
            label="Meal type"
            tabs={MEAL_TYPE_TABS}
            selectedId={mealType}
            onSelect={setMealType}
          >
            <ul className="space-y-2">
              {suggestions.choices[mealType].map((meal) => (
                <li key={meal.id}>
                  <DraggableMeal meal={meal} />
                </li>
              ))}
            </ul>
          </Tabs>
        </>
      ) : (
        <UnavailableSuggestions suggestions={suggestions} />
      )}
    </aside>
  )
}
