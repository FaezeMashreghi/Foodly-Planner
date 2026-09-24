import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: WeeklyPlanPage,
})

function WeeklyPlanPage() {
  return <h1 className="text-title">Your week</h1>
}
