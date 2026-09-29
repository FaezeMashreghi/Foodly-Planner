import { createFileRoute } from '@tanstack/react-router'
import chef240 from '@/assets/plan-questions/chef-cooking-240.webp'
import chef480 from '@/assets/plan-questions/chef-cooking-480.webp'
import chef720 from '@/assets/plan-questions/chef-cooking-720.webp'
import { PlanQuestionsFlow } from '@/components/plan-questions/plan-questions-flow/plan-questions-flow'

export const Route = createFileRoute('/_authenticated/plan-questions')({
  component: PlanQuestionsPage,
})

function PlanQuestionsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-4 card text-center sm:flex-row sm:text-left">
        <img
          src={chef240}
          srcSet={`${chef240} 1x, ${chef480} 2x, ${chef720} 3x`}
          width={240}
          height={177}
          alt=""
          className="shrink-0"
        />
        <div className="space-y-2">
          <h1 className="text-title">Plan your next week</h1>
          <p className="text-ink-muted">
            Tell us what's in your fridge and what you feel like eating, and we'll suggest meals.
          </p>
        </div>
      </div>

      <PlanQuestionsFlow />
    </div>
  )
}
