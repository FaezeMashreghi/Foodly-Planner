import { useDroppable } from '@dnd-kit/react'
import type { Meal, MealType } from '@shared/meal/meal'
import type { SlotId } from '@shared/week-plan/week-plan'
import { MealCard } from '@/components/weekly-plan/meal-card/meal-card'
import { MealDetailsButton } from '@/components/weekly-plan/meal-details-button/meal-details-button'

type MealSlotProps = {
  id: SlotId
  mealType: MealType
  meal?: Meal
}

export function MealSlot({ id, mealType, meal }: MealSlotProps) {
  const { ref, isDropTarget } = useDroppable({ id })

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-ink-muted">{mealType}</h3>
      <div
        ref={ref}
        className={`min-h-20 rounded-control border border-dashed p-2 ${
          isDropTarget ? 'border-brand bg-brand-soft' : 'border-line-strong'
        }`}
      >
        {meal ? (
          <MealCard meal={meal} action={<MealDetailsButton meal={meal} />} />
        ) : (
          <p className="text-sm text-ink-muted">No meal yet</p>
        )}
      </div>
    </div>
  )
}
