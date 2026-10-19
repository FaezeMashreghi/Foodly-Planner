import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  EMPTY_PLAN_ANSWER_LABELS,
  EMPTY_PLAN_ANSWERS,
  type PlanAnswers,
} from '@shared/week-plan/week-plan'
import { ApiError } from '@/api/foodly/api-error'
import { extractPlanAnswers, savePlanAnswers } from '@/api/foodly/plan'
import { queryKeys } from '@/api/foodly/query-keys'
import { ExtractErrorScreen } from '@/components/plan-questions/extract-error-screen/extract-error-screen'
import { PlanReview } from '@/components/plan-questions/plan-review/plan-review'
import { PlanWizard } from '@/components/plan-questions/plan-wizard/plan-wizard'
import {
  answersToText,
  type PlanAnswersText,
} from '@/components/plan-questions/plan-wizard/questions'
import { StartDayScreen } from '@/components/plan-questions/start-day-screen/start-day-screen'
import { ROUTES } from '@/lib/routes'
import { questionIndexOf, type PlanStep } from './plan-step'
import { usePlanDraft } from '@/hooks/use-plan-draft'

type PlanQuestionsFlowProps = {
  /** From the URL (?step=2), so the browser's Back goes to the previous screen. */
  step: PlanStep
}

export function PlanQuestionsFlow({ step }: PlanQuestionsFlowProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { typedAnswers, extractedAnswers, answerLabels, updateDraft } = usePlanDraft()
  const [today] = useState(() => new Date())

  function goToStep(nextStep: PlanStep) {
    void navigate({ to: ROUTES.planQuestions, search: { step: nextStep } })
  }

  const extractAnswersMutation = useMutation({
    mutationFn: (text: string) => extractPlanAnswers(text),
    onSuccess: ({ labels, ...answers }) => {
      updateDraft({ extractedAnswers: answers, answerLabels: labels })
      goToStep('review')
    },
  })

  const saveAnswersMutation = useMutation({
    mutationFn: ({ startDate, answers }: { startDate: string; answers: PlanAnswers }) =>
      savePlanAnswers(startDate, answers),
    onSuccess: async ({ weekStart }) => {
      // Cached suggestions were scored from the old answers.
      await queryClient.invalidateQueries({ queryKey: queryKeys.planSuggestions(weekStart) })
      await navigate({ to: ROUTES.weeklyPlan, search: { start: weekStart } })
    },
  })

  function handleQuestionChange(questionIndex: number, answers: PlanAnswersText) {
    updateDraft({ typedAnswers: answers })
    goToStep(questionIndex + 1)
  }

  function handleQuestionsDone(answers: PlanAnswersText) {
    const answersAsText = answersToText(answers)
    // Nothing typed at all: nothing for the AI to read, so no call (and no cost).
    if (!answersAsText) {
      updateDraft({
        typedAnswers: answers,
        extractedAnswers: EMPTY_PLAN_ANSWERS,
        answerLabels: EMPTY_PLAN_ANSWER_LABELS,
      })
      goToStep('review')
      return
    }
    updateDraft({ typedAnswers: answers })
    extractAnswersMutation.mutate(answersAsText)
  }

  function handleRetry() {
    extractAnswersMutation.mutate(answersToText(typedAnswers))
  }

  function handleStartDayBack() {
    saveAnswersMutation.reset()
    goToStep('review')
  }

  function handleStartDayConfirm(startDate: string, answers: PlanAnswers) {
    saveAnswersMutation.mutate({ startDate, answers })
  }

  if (extractAnswersMutation.isPending) {
    return (
      <p role="status" className="card text-ink-muted">
        Reading your answers…
      </p>
    )
  }

  if (extractAnswersMutation.isError) {
    const { error } = extractAnswersMutation
    return (
      <ExtractErrorScreen
        dailyLimitReached={error instanceof ApiError && error.code === 'daily-limit'}
        onEdit={() => extractAnswersMutation.reset()}
        onRetry={handleRetry}
      />
    )
  }

  if (step === 'review' && extractedAnswers) {
    return (
      <PlanReview
        answers={extractedAnswers}
        labels={answerLabels}
        onEdit={() => goToStep(1)}
        onConfirm={() => goToStep('start-day')}
      />
    )
  }

  if (step === 'start-day' && extractedAnswers) {
    return (
      <StartDayScreen
        today={today}
        isSaving={saveAnswersMutation.isPending}
        saveError={
          saveAnswersMutation.isError ? "We couldn't save your plan. Please try again." : undefined
        }
        onBack={handleStartDayBack}
        onConfirm={(startDate) => handleStartDayConfirm(startDate, extractedAnswers)}
      />
    )
  }

  return (
    <PlanWizard
      questionIndex={questionIndexOf(step)}
      initialAnswers={typedAnswers}
      onQuestionChange={handleQuestionChange}
      onDone={handleQuestionsDone}
    />
  )
}
