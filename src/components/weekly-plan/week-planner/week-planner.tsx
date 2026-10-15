import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { lazy, useMemo, useState } from 'react'
import type { Meal } from '@shared/meal/meal'
import { daysFrom, type SlotId } from '@shared/week-plan/week-plan'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { planQueryOptions, planSuggestionsQueryOptions } from '@/api/foodly/plan'
import { loadDesktopWeek } from '@/components/weekly-plan/desktop-week/load-desktop-week'
import { WeekDayTabs } from '@/components/weekly-plan/week-day-tabs/week-day-tabs'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useSavePlanSlots } from '@/hooks/use-save-plan-slots'
import { LARGE_SCREEN } from '@/lib/breakpoints'
import { placeMeal } from './place-meal'
import {
  toMealChoices,
  type SuggestionsState,
  type WeekViewProps,
} from '@/components/weekly-plan/week-view'

const DesktopWeek = lazy(loadDesktopWeek)

export function WeekPlanner({ weekStart }: { weekStart: string }) {
  const { data: meals } = useSuspenseQuery(mealsQueryOptions)
  const { data: plan } = useSuspenseQuery(planQueryOptions(weekStart))
  // Not a suspense query: the week shows while suggestions load, and if they fail.
  const suggestionsQuery = useQuery(planSuggestionsQueryOptions(weekStart))
  const mealsById = useMemo(() => new Map(meals.map((meal) => [meal.id, meal])), [meals])
  const isLargeScreen = useMediaQuery(LARGE_SCREEN)
  const [message, setMessage] = useState('')
  const save = useSavePlanSlots(weekStart, showSaveError)

  function showSaveError() {
    setMessage("Couldn't save your week. Please try again.")
  }

  function retrySuggestions() {
    void suggestionsQuery.refetch()
  }

  function placeInSlot(slotId: SlotId, meal: Meal) {
    const result = placeMeal(plan.slots, slotId, meal, mealsById)
    if (result.slots !== plan.slots) save.mutate({ weekStart, slots: result.slots })
    setMessage(result.message)
  }

  function getSuggestions(): SuggestionsState {
    if (suggestionsQuery.data) {
      return { status: 'success', choices: toMealChoices(suggestionsQuery.data, mealsById) }
    }
    if (suggestionsQuery.isError) return { status: 'error', retry: retrySuggestions }
    return { status: 'pending' }
  }

  const suggestions = getSuggestions()
  const weekView: WeekViewProps = {
    days: daysFrom(weekStart),
    slots: plan.slots,
    mealsById,
    suggestions,
    onPlace: placeInSlot,
  }

  return (
    <>
      <p role="status" className="min-h-6 text-sm text-ink-muted">
        {message}
      </p>

      {isLargeScreen ? (
        // A lazy component: while it loads the route shows WeekPlanSkeleton, and a failed
        // download shows the route's error page (the loader normally downloads it first).
        <DesktopWeek {...weekView} />
      ) : (
        <WeekDayTabs {...weekView} />
      )}
    </>
  )
}
