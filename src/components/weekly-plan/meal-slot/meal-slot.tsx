import { useDroppable } from '@dnd-kit/react'
import type { Food } from '@shared/food/food'
import type { Meal, SlotId } from '@shared/week-plan/week-plan'
import { FoodCard } from '@/components/ui/food-card/food-card'

type MealSlotProps = {
  id: SlotId
  meal: Meal
  food?: Food
}

export function MealSlot({ id, meal, food }: MealSlotProps) {
  const { ref, isDropTarget } = useDroppable({ id })

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-ink-muted">{meal}</h3>
      <div
        ref={ref}
        className={`min-h-20 rounded-control border border-dashed p-2 ${
          isDropTarget ? 'border-brand bg-brand-soft' : 'border-line-strong'
        }`}
      >
        {food ? (
          <FoodCard title={food.title} description={food.description} imageUrl={food.imageUrl} />
        ) : (
          <p className="text-sm text-ink-muted">No food yet</p>
        )}
      </div>
    </div>
  )
}
