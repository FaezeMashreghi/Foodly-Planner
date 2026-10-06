import type { ReactNode, Ref } from 'react'
import { getCuisineName } from '@shared/meal/cuisines'
import type { Meal } from '@shared/meal/meal'
import { ChipList } from '@/components/ui/chip-list/chip-list'

type MealCardProps = {
  meal: Meal
  /** Shows "Breakfast / Lunch / Dinner" labels; not needed inside a meal slot. */
  showMealTypes?: boolean
  /** A small control on the bottom line, right-aligned. It sits next to the content, not
   *  inside it, so the content can itself be interactive (e.g. a drag handle). */
  action?: ReactNode
  contentRef?: Ref<HTMLDivElement>
  contentClassName?: string
}

export function MealCard({
  meal,
  showMealTypes = false,
  action,
  contentRef,
  contentClassName = '',
}: MealCardProps) {
  const description = `${getCuisineName(meal.cuisine)} · ${meal.prepMinutes} min · ${meal.difficulty}`
  const mealTypeList =
    showMealTypes && meal.mealTypes.length > 0 ? (
      <ChipList
        size="small"
        label="Good for"
        chips={meal.mealTypes.map((mealType) => ({ id: mealType, label: mealType }))}
      />
    ) : null

  return (
    <div className="rounded-control border border-line bg-surface">
      <div
        ref={contentRef}
        className={`flex items-start gap-3 rounded-control p-2 ${contentClassName}`}
      >
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-control bg-brand-soft text-2xl"
        >
          {meal.emoji}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{meal.name}</p>
          <p className="line-clamp-2 text-sm text-ink-muted">{description}</p>
          {!action && mealTypeList && <div className="mt-1">{mealTypeList}</div>}
        </div>
      </div>
      {action && (
        // Lined up with the text above: 8px padding + 48px emoji + 12px gap = pl-17.
        <div className="flex items-center justify-between gap-2 pr-1 pl-17">
          {mealTypeList ?? <span />}
          {action}
        </div>
      )}
    </div>
  )
}
