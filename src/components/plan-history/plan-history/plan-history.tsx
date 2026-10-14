import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { planHistoryQueryOptions } from '@/api/foodly/plan'
import { HistoryWeek } from '@/components/plan-history/history-week/history-week'
import { ROUTES } from '@/lib/routes'

export function PlanHistory() {
  const { data: meals } = useSuspenseQuery(mealsQueryOptions)
  const { data: history } = useSuspenseQuery(planHistoryQueryOptions())
  const mealsById = useMemo(() => new Map(meals.map((meal) => [meal.id, meal])), [meals])

  if (history.plans.length === 0) {
    return (
      <div className="space-y-4 card">
        <p>You haven't planned any meals yet.</p>
        <Link to={ROUTES.planQuestions} className="btn-primary">
          Plan with Foodly
        </Link>
      </div>
    )
  }

  return (
    <ul role="list" className="space-y-3">
      {history.plans.map((plan, index) => (
        <li key={plan.weekStart}>
          <HistoryWeek plan={plan} mealsById={mealsById} defaultOpen={index === 0} />
        </li>
      ))}
    </ul>
  )
}
