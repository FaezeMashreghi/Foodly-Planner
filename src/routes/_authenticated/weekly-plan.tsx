import { createFileRoute } from '@tanstack/react-router'
import { isIsoDate, weekStartOf } from '@shared/week-plan/week-plan'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { planQueryOptions, planSuggestionsQueryOptions } from '@/api/foodly/plan'
import { formatLongDate } from '@/lib/format-date'
import { WeekPlanner } from '@/components/weekly-plan/week-planner/week-planner'

export const Route = createFileRoute('/_authenticated/weekly-plan')({
  // ?start=2026-10-01 opens the plan that starts that day; without it, this week's plan.
  validateSearch: (search): { start?: string } => ({
    start: isIsoDate(search.start) ? search.start : undefined,
  }),
  loaderDeps: ({ search }) => ({ start: search.start }),
  loader: async ({ context, deps }) => {
    const weekStart = deps.start ?? weekStartOf(new Date())
    await Promise.all([
      context.queryClient.query(mealsQueryOptions),
      context.queryClient.query({ ...planQueryOptions(weekStart), staleTime: 'static' }),
      context.queryClient.query(planSuggestionsQueryOptions(weekStart)),
    ])
    return { weekStart }
  },
  component: WeeklyPlanPage,
})

function WeeklyPlanPage() {
  const { weekStart } = Route.useLoaderData()

  return (
    <div className="space-y-2">
      <h1 className="text-title">Your week</h1>
      <p className="text-ink-muted">7 days from {formatLongDate(weekStart)}</p>
      <WeekPlanner weekStart={weekStart} />
    </div>
  )
}
