import type { ReactNode, Ref } from 'react'
import type { Meal } from '@shared/meal/meal'
import { ChipList } from '@/components/ui/chip-list/chip-list'

type MealCardProps = {
  meal: Meal
  showMealTypes?: boolean
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
  const description = `${meal.cuisineName} · ${meal.prepMinutes} min · ${meal.difficulty}`
  const mealTypeList =
    showMealTypes && meal.mealTypes.length > 0 ? (
      <ChipList
        size="small"
        label="Good for"
        chips={meal.mealTypes.map((mealType) => ({ id: mealType, label: mealType }))}
      />
    ) : null

  return (
    <div className="@container rounded-control border border-line bg-surface">
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
        <div className="flex flex-wrap items-center justify-between gap-x-2 px-1 @xs:pl-17">
          {mealTypeList}
          <div className="ml-auto flex flex-wrap justify-end">{action}</div>
        </div>
      )}
    </div>
  )
}
