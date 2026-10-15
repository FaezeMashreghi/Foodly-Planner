import { Link } from '@tanstack/react-router'
import { formatLongDate } from '@/lib/format-date'
import { ROUTES } from '@/lib/routes'

export function WeekPlanHeader({ weekStart }: { weekStart?: string }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-title">Your week</h1>
        <Link to={ROUTES.planHistory} className="btn-secondary">
          Plan history
        </Link>
      </div>
      {weekStart ? (
        <p className="text-ink-muted">7 days from {formatLongDate(weekStart)}</p>
      ) : (
        <div aria-hidden="true" className="h-6 w-56 skeleton" />
      )}
    </>
  )
}
