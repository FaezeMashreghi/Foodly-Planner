import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { TextArea } from '@/components/ui/text-area/text-area'
import { PLAN_QUESTIONS, type PlanAnswersText } from './questions'
import { MAX_ANSWER_LENGTH } from '@shared/plan/plan-limits'
type PlanWizardProps = {
  /** Answers to start from, e.g. when the user comes back to change them. */
  initialAnswers?: PlanAnswersText
  /** Called with every answer (empty if skipped) after the last question. */
  onDone: (answers: PlanAnswersText) => void
}

export function PlanWizard({ initialAnswers = {}, onDone }: PlanWizardProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'next' | 'back'>('next')
  const [answers, setAnswers] = useState<PlanAnswersText>(initialAnswers)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const moved = useRef(false)
  const progressId = useId()

  const question = PLAN_QUESTIONS[step]
  const isLast = step === PLAN_QUESTIONS.length - 1

  // After Next or Back, focus the new answer box: a screen reader then reads the new question.
  // Not on the first render, so arriving on the page starts at its title.
  useEffect(() => {
    if (moved.current) inputRef.current?.focus()
  }, [step])

  function go(to: number) {
    moved.current = true
    setDirection(to > step ? 'next' : 'back')
    setStep(to)
  }

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
    else go(step + 1)
  }

  return (
    <section aria-label="Plan questions" className="space-y-4 overflow-hidden card">
      <div className="flex items-center justify-between gap-4">
        <p id={progressId} className="text-sm font-semibold text-ink-muted">
          Question {step + 1} of {PLAN_QUESTIONS.length}
        </p>
        <ol aria-hidden="true" className="flex gap-1.5">
          {PLAN_QUESTIONS.map((item, index) => (
            <li
              key={item.id}
              className={`size-2.5 rounded-full ${index <= step ? 'bg-brand' : 'bg-line'}`}
            />
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          key={step}
          className={direction === 'next' ? 'animate-slide-in-next' : 'animate-slide-in-back'}
        >
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
          Tip: press Ctrl + Enter (⌘ + Enter on a Mac) to go on.
        </p>

        <div className="flex justify-between gap-2">
          {step > 0 ? (
            <button type="button" className="btn-secondary" onClick={() => go(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn-primary">
            {isLast ? 'Find meals' : 'Next'}
          </button>
        </div>
      </form>
    </section>
  )
}
