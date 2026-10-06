import { useId, useState, type FormEvent, type KeyboardEvent } from 'react'
import { MAX_ANSWER_LENGTH } from '@shared/plan/plan-limits'
import { StepProgress } from '@/components/ui/step-progress/step-progress'
import { TextArea } from '@/components/ui/text-area/text-area'
import { useFocusOnChange } from '@/hooks/use-focus-on-change'
import { useSlideDirection } from '@/hooks/use-slide-direction'
import { PLAN_QUESTIONS, type PlanAnswersText } from './questions'

const slideClass = {
  next: 'animate-slide-in-next',
  back: 'animate-slide-in-back',
}

type PlanWizardProps = {
  questionIndex: number
  initialAnswers?: PlanAnswersText
  onQuestionChange: (questionIndex: number, answers: PlanAnswersText) => void
  onDone: (answers: PlanAnswersText) => void
}

export function PlanWizard({
  questionIndex,
  initialAnswers = {},
  onQuestionChange,
  onDone,
}: PlanWizardProps) {
  const [answers, setAnswers] = useState<PlanAnswersText>(initialAnswers)
  const direction = useSlideDirection(questionIndex)
  const inputRef = useFocusOnChange<HTMLTextAreaElement>(questionIndex)
  const progressId = useId()

  const question = PLAN_QUESTIONS[questionIndex]
  const isFirst = questionIndex === 0
  const isLast = questionIndex === PLAN_QUESTIONS.length - 1

  // Enter makes a new line; Ctrl+Enter (⌘+Enter on a Mac) goes on, as in many apps.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isLast) onDone(answers)
    else onQuestionChange(questionIndex + 1, answers)
  }

  function handleBack() {
    onQuestionChange(questionIndex - 1, answers)
  }

  return (
    <section aria-label="Plan questions" className="space-y-4 overflow-hidden card">
      <StepProgress
        id={progressId}
        current={questionIndex + 1}
        total={PLAN_QUESTIONS.length}
        label="Question"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div key={questionIndex} className={slideClass[direction]}>
          <TextArea
            ref={inputRef}
            label={question.text}
            labelSize="large"
            hint={question.hint}
            aria-describedby={progressId}
            value={answers[question.id] ?? ''}
            onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}
            onKeyDown={handleKeyDown}
            maxLength={MAX_ANSWER_LENGTH}
          />
        </div>

        <p className="text-sm text-ink-muted">
          Tip: press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (<kbd>⌘</kbd> + <kbd>Enter</kbd> on a Mac)
          to go on.
        </p>

        <div className="flex gap-2">
          {!isFirst && (
            <button type="button" className="btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          <button type="submit" className="ml-auto btn-primary">
            {isLast ? 'Find meals' : 'Next'}
          </button>
        </div>
      </form>
    </section>
  )
}
