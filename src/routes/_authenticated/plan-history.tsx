import { noop } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import historyPlan240 from '@/assets/history-plan/history-plan-240.webp'
import historyPlan480 from '@/assets/history-plan/history-plan-480.webp'
import historyPlan720 from '@/assets/history-plan/history-plan-720.webp'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { planHistoryQueryOptions } from '@/api/foodly/plan'
import { PagePending } from '@/components/layout/page-pending/page-pending'
import { PlanHistory } from '@/components/plan-history/plan-history/plan-history'

export const Route = createFileRoute('/_authenticated/plan-history')({
  // Not awaited: the intro card shows at once and only the list waits (see <Suspense> below).
  // Errors are swallowed here; useSuspenseQuery throws them again for the error page.
  loader: ({ context }) => {
    void context.queryClient.query(mealsQueryOptions).catch(noop)
    void context.queryClient.query(planHistoryQueryOptions()).catch(noop)
  },
  component: PlanHistoryPage,
})

function PlanHistoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col items-center gap-4 card text-center sm:flex-row sm:text-left">
        <img
          src={historyPlan240}
          srcSet={`${historyPlan240} 1x, ${historyPlan480} 2x, ${historyPlan720} 3x`}
          width={240}
          height={166}
          alt=""
          className="shrink-0"
        />
        <div className="space-y-2">
          <h1 className="text-title">Plan history</h1>
          <p className="text-ink-muted">Every week you've planned, newest first.</p>
        </div>
      </div>

      <Suspense fallback={<PagePending />}>
        <PlanHistory />
      </Suspense>
    </div>
  )
}
