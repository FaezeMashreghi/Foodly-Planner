import { useId } from 'react'
import { getCuisineName } from '@shared/meal/cuisines'
import type { PlanAnswers } from '@shared/week-plan/week-plan'
import { ChipList } from '@/components/ui/chip-list/chip-list'
import { ReviewTile } from '@/components/plan-questions/review-tile/review-tile'
import { useFocusOnMount } from '@/hooks/use-focus-on-mount'
import { describeCookingTime, toIngredientChips } from './review-text'

type PlanReviewProps = {
  answers: PlanAnswers
  mustHaveMealName?: string
  onConfirm: () => void
  onEdit: () => void
}

export function PlanReview({ answers, mustHaveMealName, onConfirm, onEdit }: PlanReviewProps) {
  const headingId = useId()
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  const feelLike = [
    ...answers.cuisines.map((id) => ({ id, label: getCuisineName(id) })),
    ...toIngredientChips(answers.wantMore),
  ]
  const time = describeCookingTime(answers)
  const dish = mustHaveMealName ?? answers.mustHaveText
  const showWrote =
    mustHaveMealName &&
    answers.mustHaveText &&
    answers.mustHaveText.toLowerCase() !== mustHaveMealName.toLowerCase()

  return (
    <section aria-labelledby={headingId} className="animate-slide-in-next space-y-5 card">
      <div className="space-y-1">
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-heading">
          Here's what we understood
        </h2>
        <p className="text-ink-muted">Check it before we pick your meals.</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <ReviewTile icon="🧺" label="Going off soon">
          {answers.expiring.length > 0 && <ChipList chips={toIngredientChips(answers.expiring)} />}
        </ReviewTile>

        <ReviewTile icon="🍽️" label="You feel like">
          {feelLike.length > 0 && <ChipList chips={feelLike} />}
        </ReviewTile>

        <ReviewTile icon="⏱️" label="Cooking time">
          {time && <p className="font-semibold">{time}</p>}
        </ReviewTile>

        <ReviewTile icon="⭐" label="A dish you really want">
          {dish && (
            <div className="space-y-1">
              <p className="font-semibold">{dish}</p>
              {answers.mustHaveMealId === null && (
                <p className="text-sm text-ink-muted">We don't have this one in our meals yet.</p>
              )}
              {showWrote && (
                <p className="text-sm text-ink-muted">You wrote: “{answers.mustHaveText}”</p>
              )}
            </div>
          )}
        </ReviewTile>

        {answers.avoid.length > 0 && (
          <ReviewTile icon="🚫" label="Leave out">
            <ChipList chips={toIngredientChips(answers.avoid)} />
          </ReviewTile>
        )}

        {answers.notes.length > 0 && (
          <ReviewTile icon="📝" label="Also noted" className="sm:col-span-2">
            <ul className="list-disc space-y-1 pl-5">
              {answers.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </ReviewTile>
        )}
      </dl>

      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={onEdit}>
          Change my answers
        </button>
        <button type="button" className="btn-primary" onClick={onConfirm}>
          Next
        </button>
      </div>
    </section>
  )
}
