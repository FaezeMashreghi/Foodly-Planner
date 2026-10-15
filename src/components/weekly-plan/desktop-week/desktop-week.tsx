import { DragDropProvider, DragOverlay, type DragEndEvent } from '@dnd-kit/react'
import { isSlotId } from '@shared/week-plan/week-plan'
import { DaySection } from '@/components/weekly-plan/day-section/day-section'
import { DroppableMealSlot } from '@/components/weekly-plan/droppable-meal-slot/droppable-meal-slot'
import { MealCard } from '@/components/weekly-plan/meal-card/meal-card'
import { SuggestionList } from '@/components/weekly-plan/suggestion-list/suggestion-list'
import { SuggestionsPlaceholder } from '@/components/weekly-plan/suggestions-placeholder/suggestions-placeholder'
import type { WeekViewProps } from '@/components/weekly-plan/week-planner/week-view'

export function DesktopWeek({ days, slots, mealsById, suggestions, onPlace }: WeekViewProps) {
  function findMeal(id: unknown) {
    return typeof id === 'string' ? mealsById.get(id) : undefined
  }

  function handleDragEnd({ operation, canceled }: DragEndEvent) {
    const { source, target } = operation
    if (canceled || !source || !target || !isSlotId(target.id)) return
    const meal = findMeal(source.id)
    if (meal) onPlace(target.id, meal)
  }

  function renderDragOverlay(source: { id: unknown }) {
    const meal = findMeal(source.id)
    return meal ? <MealCard meal={meal} showMealTypes /> : null
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="mt-2 grid grid-cols-4 gap-6">
        <div className="col-span-3 space-y-4">
          {days.map((day) => (
            <DaySection
              key={day}
              day={day}
              slots={slots}
              mealsById={mealsById}
              suggestions={suggestions}
              onPlace={onPlace}
              slotComponent={DroppableMealSlot}
            />
          ))}
        </div>
        {suggestions.status === 'success' ? (
          <SuggestionList
            choices={suggestions.choices}
            className="sticky top-4 max-h-screen self-start"
          />
        ) : (
          <SuggestionsPlaceholder suggestions={suggestions} />
        )}
      </div>

      <DragOverlay dropAnimation={null}>{renderDragOverlay}</DragOverlay>
    </DragDropProvider>
  )
}
