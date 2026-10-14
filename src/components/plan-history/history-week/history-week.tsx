import type { Meal } from '@shared/meal/meal'
import type { Plan } from '@shared/week-plan/week-plan'
import { formatDateWithYear } from '@/lib/format-date'
import { weekMeals } from './week-meals'

type HistoryWeekProps = {
  plan: Plan
  mealsById: Map<string, Meal>
  defaultOpen?: boolean
}

export function HistoryWeek({ plan, mealsById, defaultOpen = false }: HistoryWeekProps) {
  const days = weekMeals(plan)
  const mealCount = days.reduce((count, day) => count + day.meals.length, 0)

  return (
    <details open={defaultOpen} className="card">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">
        Week of {formatDateWithYear(plan.weekStart)}
        <span className="font-normal text-ink-muted">
          {' '}
          · {mealCount} {mealCount === 1 ? 'meal' : 'meals'}
        </span>
      </summary>

      <dl className="mt-2 divide-y divide-line">
        {days.map(({ day, meals }) => (
          <div key={day} className="grid gap-1 py-3 sm:grid-cols-4">
            <dt className="font-semibold">{day}</dt>
            {meals.map(({ mealType, mealId }) => {
              const meal = mealsById.get(mealId)
              return (
                <dd key={mealType} className="sm:col-span-3 sm:col-start-2">
                  <span className="text-ink-muted">{mealType}:</span>{' '}
                  {meal && <span aria-hidden="true">{meal.emoji} </span>}
                  {meal?.name ?? 'Meal no longer available'}
                </dd>
              )
            })}
          </div>
        ))}
      </dl>
    </details>
  )
}
