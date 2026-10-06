import { MEAL_TYPES, type Meal } from '@shared/meal/meal'
import { toSlotId, type Day, type PlanSlots } from '@shared/week-plan/week-plan'
import { MealSlot } from '@/components/weekly-plan/meal-slot/meal-slot'

type DaySectionProps = {
  day: Day
  slots: PlanSlots
  mealsById: Map<string, Meal>
}

export function DaySection({ day, slots, mealsById }: DaySectionProps) {
  const headingId = `day-section-${day.toLowerCase()}`

  return (
    <section aria-labelledby={headingId} className="space-y-3 card">
      <h2 id={headingId} className="text-heading">
        {day}
      </h2>

      <div className="grid gap-3 md:grid-cols-3">
        {MEAL_TYPES.map((mealType) => {
          const slotId = toSlotId(day, mealType)
          const mealId = slots[slotId]
          return (
            <MealSlot
              key={mealType}
              id={slotId}
              mealType={mealType}
              meal={mealId ? mealsById.get(mealId) : undefined}
            />
          )
        })}
      </div>
    </section>
  )
}
