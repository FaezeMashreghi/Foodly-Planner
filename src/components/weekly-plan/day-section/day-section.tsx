import { MEALS, toSlotId, type Day, type WeekPlan } from '@shared/week-plan/week-plan'
import { MealSlot } from '@/components/weekly-plan/meal-slot/meal-slot'

type DaySectionProps = {
  day: Day
  plan: WeekPlan
}

export function DaySection({ day, plan }: DaySectionProps) {
  const headingId = `day-section-${day.toLowerCase()}`

  return (
    <section aria-labelledby={headingId} className="space-y-3 card">
      <h2 id={headingId} className="text-heading">
        {day}
      </h2>

      <div className="grid gap-3 md:grid-cols-3">
        {MEALS.map((meal) => {
          const slotId = toSlotId(day, meal)
          return <MealSlot key={meal} id={slotId} meal={meal} food={plan[slotId]} />
        })}
      </div>
    </section>
  )
}
