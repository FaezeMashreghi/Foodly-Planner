import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { useState } from 'react'
import { isSlotId, setSlotFood, type SlotId, type WeekPlan } from '@shared/week-plan/week-plan'
import { FoodCard } from '@/components/ui/food-card/food-card'
import { SuggestionList } from '@/components/weekly-plan/suggestion-list/suggestion-list'
import { WeekGrid } from '@/components/weekly-plan/week-grid/week-grid'
import { MOCK_FOODS } from './mock-foods'

function findFood(id: unknown) {
  return MOCK_FOODS.find((food) => food.id === id)
}

export function WeekPlanner() {
  const [plan, setPlan] = useState<WeekPlan>({})
  const [message, setMessage] = useState('')

  function placeFood(slotId: SlotId, foodId: unknown) {
    const food = findFood(foodId)
    if (!food) return

    const previous = plan[slotId]
    const nextPlan = setSlotFood(plan, slotId, food)
    if (nextPlan === plan) {
      setMessage(`${food.title} is already in ${slotId}`)
      return
    }
    setPlan(nextPlan)
    setMessage(
      previous
        ? `Replaced ${previous.title} with ${food.title} in ${slotId}`
        : `Added ${food.title} to ${slotId}`,
    )
  }

  return (
    <DragDropProvider
      onDragEnd={({ operation, canceled }) => {
        const { source, target } = operation
        if (canceled || !source || !target || !isSlotId(target.id)) return
        placeFood(target.id, source.id)
      }}
    >
      <p role="status" className="min-h-6 text-sm text-ink-muted">
        {message}
      </p>

      <div className="mt-2 grid gap-6 lg:grid-cols-4">
        <WeekGrid plan={plan} className="lg:col-span-3" />
        <SuggestionList
          foods={MOCK_FOODS}
          className="max-h-96 lg:sticky lg:top-4 lg:max-h-screen lg:self-start"
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {(source) => {
          const food = findFood(source.id)
          return food ? (
            <FoodCard title={food.title} description={food.description} imageUrl={food.imageUrl} />
          ) : null
        }}
      </DragOverlay>
    </DragDropProvider>
  )
}
