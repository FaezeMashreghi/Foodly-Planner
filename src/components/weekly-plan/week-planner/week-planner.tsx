import { DragDropProvider, DragOverlay, type DragEndEvent } from '@dnd-kit/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { daysFrom, isSlotId } from '@shared/week-plan/week-plan'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { planQueryOptions, planSuggestionsQueryOptions } from '@/api/foodly/plan'
import { MealCard } from '@/components/weekly-plan/meal-card/meal-card'
import { SuggestionList } from '@/components/weekly-plan/suggestion-list/suggestion-list'
import { WeekGrid } from '@/components/weekly-plan/week-grid/week-grid'
import { placeMeal } from './place-meal'
import { useSavePlanSlots } from '@/hooks/use-save-plan-slots'

export function WeekPlanner({ weekStart }: { weekStart: string }) {
  const { data: meals } = useSuspenseQuery(mealsQueryOptions)
  const { data: plan } = useSuspenseQuery(planQueryOptions(weekStart))
  const { data: suggestions } = useSuspenseQuery(planSuggestionsQueryOptions(weekStart))
  const mealsById = useMemo(() => new Map(meals.map((meal) => [meal.id, meal])), [meals])
  const days = daysFrom(weekStart)
  const [message, setMessage] = useState('')

  const save = useSavePlanSlots(weekStart, showSaveError)

  function showSaveError() {
    setMessage("Couldn't save your week. Please try again.")
  }

  function findMeal(id: unknown) {
    return typeof id === 'string' ? mealsById.get(id) : undefined
  }

  function handleDragEnd({ operation, canceled }: DragEndEvent) {
    const { source, target } = operation
    if (canceled || !source || !target || !isSlotId(target.id)) return
    const meal = findMeal(source.id)
    if (!meal) return

    const result = placeMeal(plan.slots, target.id, meal, mealsById)
    if (result.slots !== plan.slots) save.mutate({ weekStart, slots: result.slots })
    setMessage(result.message)
  }

  function renderDragOverlay(source: { id: unknown }) {
    const meal = findMeal(source.id)
    return meal ? <MealCard meal={meal} showMealTypes /> : null
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <p role="status" className="min-h-6 text-sm text-ink-muted">
        {message}
      </p>

      <div className="mt-2 grid gap-6 lg:grid-cols-4">
        <WeekGrid days={days} slots={plan.slots} mealsById={mealsById} className="lg:col-span-3" />
        <SuggestionList
          suggestions={suggestions}
          mealsById={mealsById}
          className="max-h-96 lg:sticky lg:top-4 lg:max-h-screen lg:self-start"
        />
      </div>

      <DragOverlay dropAnimation={null}>{renderDragOverlay}</DragOverlay>
    </DragDropProvider>
  )
}
