import { noop } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { isIsoDate, weekStartOf } from '@shared/week-plan/week-plan'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { planQueryOptions, planSuggestionsQueryOptions } from '@/api/foodly/plan'
import { LARGE_SCREEN } from '@/lib/breakpoints'
import { loadDesktopWeek } from '@/components/weekly-plan/desktop-week/load-desktop-week'
import { WeekPlanHeader } from '@/components/weekly-plan/week-plan-header/week-plan-header'
import { WeekPlanSkeleton } from '@/components/weekly-plan/week-plan-skeleton/week-plan-skeleton'
import { WeekPlanner } from '@/components/weekly-plan/week-planner/week-planner'

export const Route = createFileRoute('/_authenticated/weekly-plan')({
  // ?start=2026-10-01 opens the plan that starts that day; without it, this week's plan.
  validateSearch: (search): { start?: string } => ({
    start: isIsoDate(search.start) ? search.start : undefined,
  }),
  loaderDeps: ({ search }) => ({ start: search.start }),
  loader: async ({ context, deps }) => {
    const weekStart = deps.start ?? weekStartOf(new Date())
    // Suggestions are extra: started here, but the week shows without them (loading or failed).
    void context.queryClient.query(planSuggestionsQueryOptions(weekStart)).catch(noop)
    await Promise.all([
      context.queryClient.query(mealsQueryOptions),
      context.queryClient.query({ ...planQueryOptions(weekStart), staleTime: 'static' }),
      // Fetch the drag-and-drop chunk alongside the data, so large screens never wait for it.
      // If it fails, the route's error page shows (a page reload fixes it; Try again can't, see decision 29).
      window.matchMedia(LARGE_SCREEN).matches && loadDesktopWeek(),
    ])
    return { weekStart }
  },
  component: WeeklyPlanPage,
  pendingComponent: WeekPlanSkeleton,
  pendingMs: 200,
  pendingMinMs: 500,
})

function WeeklyPlanPage() {
  const { weekStart } = Route.useLoaderData()

  return (
    <div className="space-y-2">
      <WeekPlanHeader weekStart={weekStart} />
      <WeekPlanner weekStart={weekStart} />
    </div>
  )
}
