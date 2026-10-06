import { useDraggable } from '@dnd-kit/react'
import type { Meal } from '@shared/meal/meal'
import { MealCard } from '@/components/weekly-plan/meal-card/meal-card'
import { MealDetailsButton } from '@/components/weekly-plan/meal-details-button/meal-details-button'

export function DraggableMeal({ meal }: { meal: Meal }) {
  const { ref, handleRef, isDragSource } = useDraggable({ id: meal.id })

  return (
    <div ref={ref} className={isDragSource ? 'opacity-50' : ''}>
      <MealCard
        meal={meal}
        showMealTypes
        contentRef={handleRef}
        contentClassName="cursor-grab touch-none"
        action={<MealDetailsButton meal={meal} />}
      />
    </div>
  )
}
