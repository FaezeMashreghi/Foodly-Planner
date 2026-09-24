import { useDraggable } from '@dnd-kit/react'
import type { Food } from '@shared/food/food'
import { FoodCard } from '@/components/ui/food-card/food-card'

type DraggableFoodProps = {
  food: Food
}

export function DraggableFood({ food }: DraggableFoodProps) {
  const { ref, isDragSource } = useDraggable({ id: food.id })

  return (
    <div
      ref={ref}
      className={`cursor-grab touch-none rounded-control ${isDragSource ? 'opacity-50' : ''}`}
    >
      <FoodCard title={food.title} description={food.description} imageUrl={food.imageUrl} />
    </div>
  )
}
