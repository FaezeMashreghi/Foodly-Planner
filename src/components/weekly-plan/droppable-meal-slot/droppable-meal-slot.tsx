import { useDroppable } from '@dnd-kit/react'
import { toSlotId } from '@shared/week-plan/week-plan'
import { MealSlot, type MealSlotProps } from '@/components/weekly-plan/meal-slot/meal-slot'

export function DroppableMealSlot(props: MealSlotProps) {
  const { ref, isDropTarget } = useDroppable({ id: toSlotId(props.day, props.mealType) })
  return <MealSlot {...props} dropRef={ref} isDropTarget={isDropTarget} />
}
