import type { ComponentType } from 'react'
import { MEAL_TYPES, type Meal } from '@shared/meal/meal'
import { toSlotId, type Day, type PlanSlots } from '@shared/week-plan/week-plan'
import { MealSlot, type MealSlotProps } from '@/components/weekly-plan/meal-slot/meal-slot'
import type {
  PlaceMealInSlot,
  SuggestionsState,
} from '@/components/weekly-plan/week-planner/week-view'

type DaySectionProps = {
  day: Day
  slots: PlanSlots
  mealsById: ReadonlyMap<string, Meal>
  suggestions: SuggestionsState
  onPlace: PlaceMealInSlot
  /** `DroppableMealSlot` on large screens; plain `MealSlot` keeps dnd-kit out of phones. */
  slotComponent?: ComponentType<MealSlotProps>
}

export function DaySection({
  day,
  slots,
  mealsById,
  suggestions,
  onPlace,
  slotComponent: Slot = MealSlot,
}: DaySectionProps) {
  const headingId = `day-section-${day.toLowerCase()}`

  return (
    <section aria-labelledby={headingId} className="space-y-3 card">
      <h2 id={headingId} className="text-heading">
        {day}
      </h2>

      <div className="grid gap-3 md:grid-cols-3">
        {MEAL_TYPES.map((mealType) => {
          const mealId = slots[toSlotId(day, mealType)]
          return (
            <Slot
              key={mealType}
              day={day}
              mealType={mealType}
              meal={mealId ? mealsById.get(mealId) : undefined}
              suggestions={suggestions}
              onPlace={onPlace}
            />
          )
        })}
      </div>
    </section>
  )
}
