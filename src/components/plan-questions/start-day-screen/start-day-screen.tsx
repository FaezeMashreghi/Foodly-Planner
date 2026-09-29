import { useEffect, useRef, useState, type FormEvent } from 'react'
import { nextSevenDays } from '@shared/week-plan/week-plan'
import { FormError } from '@/components/ui/form-error/form-error'
import { RadioGroup } from '@/components/ui/radio-group/radio-group'
import { describeStartDay } from './start-day-label'

type StartDayScreenProps = {
  today: Date
  isSaving?: boolean
  saveError?: string
  onBack: () => void
  onConfirm: (startDate: string) => void
}

export function StartDayScreen({
  today,
  isSaving = false,
  saveError,
  onBack,
  onConfirm,
}: StartDayScreenProps) {
  const startDays = nextSevenDays(today)
  const [startDate, setStartDate] = useState(startDays[0])
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isSaving) onConfirm(startDate)
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slide-in-next space-y-5 card">
      <RadioGroup
        legend={
          <h2 ref={headingRef} tabIndex={-1} className="text-heading">
            When should your plan start?
          </h2>
        }
        hint="Your plan covers 7 days from this day."
        options={startDays.map((day, index) => ({
          value: day,
          label: describeStartDay(day, index),
        }))}
        value={startDate}
        onChange={setStartDate}
      />

      <FormError message={saveError} />

      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          className="btn-secondary"
          aria-disabled={isSaving}
          onClick={() => !isSaving && onBack()}
        >
          Back
        </button>
        <button type="submit" className="btn-primary" aria-disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Show my suggestions'}
        </button>
      </div>
    </form>
  )
}
