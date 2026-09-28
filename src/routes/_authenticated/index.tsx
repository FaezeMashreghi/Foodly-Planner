import { createFileRoute } from '@tanstack/react-router'
import { WeekPlanner } from '@/components/weekly-plan/week-planner/week-planner'

export const Route = createFileRoute('/_authenticated/')({
  component: WeeklyPlanPage,
})

function WeeklyPlanPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-title">Your week</h1>
      <WeekPlanner />
    </div>
  )
}
