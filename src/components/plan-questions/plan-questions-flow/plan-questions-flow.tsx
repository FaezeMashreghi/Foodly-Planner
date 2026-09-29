import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { PlanAnswers } from '@shared/week-plan/week-plan'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { extractPlanAnswers, savePlanAnswers } from '@/api/foodly/plan'
import { queryKeys } from '@/api/foodly/query-keys'
import { FormError } from '@/components/ui/form-error/form-error'
import { PlanReview } from '@/components/plan-questions/plan-review/plan-review'
import { PlanWizard } from '@/components/plan-questions/plan-wizard/plan-wizard'
import { StartDayScreen } from '@/components/plan-questions/start-day-screen/start-day-screen'
import {
  answersToText,
  type PlanAnswersText,
} from '@/components/plan-questions/plan-wizard/questions'
import { ROUTES } from '@/lib/routes'

const EMPTY_PLAN_ANSWERS: PlanAnswers = {
  expiring: [],
  wantMore: [],
  avoid: [],
  cuisines: [],
  easyOnly: false,
  maxPrepMinutes: null,
  mustHaveMealId: null,
  mustHaveText: null,
  notes: [],
}

export function PlanQuestionsFlow() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentScreen, setCurrentScreen] = useState<'questions' | 'review' | 'start-day'>(
    'questions',
  )
  const [typedAnswers, setTypedAnswers] = useState<PlanAnswersText>({})
  const [extractedAnswers, setExtractedAnswers] = useState<PlanAnswers>(EMPTY_PLAN_ANSWERS)

  const extractAnswersMutation = useMutation({
    mutationFn: (text: string) => extractPlanAnswers(text),
    onSuccess: (answers) => {
      setExtractedAnswers(answers)
      setCurrentScreen('review')
    },
  })

  const [today] = useState(() => new Date())

  const saveAnswersMutation = useMutation({
    mutationFn: (startDate: string) => savePlanAnswers(startDate, extractedAnswers),
    onSuccess: async ({ weekStart }) => {
      // The cached plan still has the old suggestions: load it again with the new answers.
      await queryClient.invalidateQueries({ queryKey: queryKeys.plan(weekStart) })
      await navigate({ to: ROUTES.weeklyPlan, search: { start: weekStart } })
    },
  })

  // Only to show the matched dish by its real name; the weekly plan loads the same query.
  const mealsQuery = useQuery({
    ...mealsQueryOptions,
    enabled: extractedAnswers.mustHaveMealId !== null,
  })
  const mustHaveMealName = mealsQuery.data?.find(
    (meal) => meal.id === extractedAnswers.mustHaveMealId,
  )?.name

  function handleQuestionsDone(answers: PlanAnswersText) {
    setTypedAnswers(answers)
    const answersAsText = answersToText(answers)
    // Nothing typed at all: nothing for the AI to read, so no call (and no cost).
    if (!answersAsText) {
      setExtractedAnswers(EMPTY_PLAN_ANSWERS)
      setCurrentScreen('review')
      return
    }
    extractAnswersMutation.mutate(answersAsText)
  }

  if (extractAnswersMutation.isPending) {
    return (
      <p role="status" className="card text-ink-muted">
        Reading your answers…
      </p>
    )
  }

  if (extractAnswersMutation.isError) {
    return (
      <div className="space-y-4 card">
        <FormError message="We couldn't read your answers. Please try again." />
        <div className="flex flex-wrap justify-between gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              extractAnswersMutation.reset()
              setCurrentScreen('questions')
            }}
          >
            Change my answers
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => extractAnswersMutation.mutate(answersToText(typedAnswers))}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (currentScreen === 'review') {
    return (
      <PlanReview
        answers={extractedAnswers}
        mustHaveMealName={mustHaveMealName}
        onEdit={() => setCurrentScreen('questions')}
        onConfirm={() => setCurrentScreen('start-day')}
      />
    )
  }

  if (currentScreen === 'start-day') {
    return (
      <StartDayScreen
        today={today}
        isSaving={saveAnswersMutation.isPending}
        saveError={
          saveAnswersMutation.isError ? "We couldn't save your plan. Please try again." : undefined
        }
        onBack={() => {
          saveAnswersMutation.reset()
          setCurrentScreen('review')
        }}
        onConfirm={(startDate) => saveAnswersMutation.mutate(startDate)}
      />
    )
  }

  return <PlanWizard initialAnswers={typedAnswers} onDone={handleQuestionsDone} />
}
