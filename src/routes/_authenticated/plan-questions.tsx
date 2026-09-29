import { createFileRoute, redirect } from '@tanstack/react-router'
import chef240 from '@/assets/plan-questions/chef-cooking-240.webp'
import chef480 from '@/assets/plan-questions/chef-cooking-480.webp'
import chef720 from '@/assets/plan-questions/chef-cooking-720.webp'
import {
  clearPlanDraft,
  loadPlanDraft,
} from '@/components/plan-questions/plan-questions-flow/plan-draft'
import { PlanQuestionsFlow } from '@/components/plan-questions/plan-questions-flow/plan-questions-flow'
import {
  needsExtractedAnswers,
  parsePlanStep,
  type PlanStep,
} from '@/components/plan-questions/plan-questions-flow/plan-step'
import { ROUTES } from '@/lib/routes'

export const Route = createFileRoute('/_authenticated/plan-questions')({
  // ?step=2 … ?step=review: each screen has its own URL, so the browser's Back works.
  validateSearch: (search): { step?: PlanStep } => ({ step: parsePlanStep(search.step) }),
  beforeLoad: ({ search }) => {
    // No step (e.g. the nav link): a new plan, so forget the last answers and start at question 1.
    // The draft stays while the user moves with ?step, so Back from the weekly plan keeps it.
    if (search.step === undefined) {
      clearPlanDraft()
      throw redirect({ to: ROUTES.planQuestions, search: { step: 1 }, replace: true })
    }
    // The review and start-day screens show the AI's answers: without them (a new tab), start over.
    if (needsExtractedAnswers(search.step) && !loadPlanDraft().extractedAnswers) {
      throw redirect({ to: ROUTES.planQuestions, search: { step: 1 }, replace: true })
    }
  },
  component: PlanQuestionsPage,
})

function PlanQuestionsPage() {
  const { step = 1 } = Route.useSearch()

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

      <PlanQuestionsFlow step={step} />
    </div>
  )
}
