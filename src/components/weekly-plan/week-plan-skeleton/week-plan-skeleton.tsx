import { WeekPlanHeader } from '@/components/weekly-plan/week-plan-header/week-plan-header'

const DAYS = [0, 1, 2, 3, 4, 5, 6]
const MEAL_TYPES = [0, 1, 2]
const SUGGESTIONS = [0, 1, 2, 3]

export function WeekPlanSkeleton() {
  return (
    <div className="space-y-2">
      <WeekPlanHeader />
      <p role="status" className="sr-only">
        Loading your week…
      </p>

      <div aria-hidden="true">
        {/* Same height as WeekPlanner's status line. */}
        <div className="min-h-6" />

        <div className="flex gap-1 py-2 lg:hidden">
          {DAYS.map((day) => (
            <div key={day} className="h-11 flex-1 skeleton" />
          ))}
        </div>

        <div className="mt-2 grid gap-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-3">
            {DAYS.map((day) => (
              <div key={day} className={`space-y-3 card ${day > 0 ? 'hidden lg:block' : ''}`}>
                <div className="h-7 w-32 skeleton" />
                <div className="grid gap-3 md:grid-cols-3">
                  {MEAL_TYPES.map((mealType) => (
                    <div key={mealType} className="space-y-1">
                      <div className="h-5 w-20 skeleton" />
                      <div className="h-20 skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden space-y-3 self-start card lg:block">
            <div className="h-7 w-36 skeleton" />
            <div className="h-11 skeleton" />
            {SUGGESTIONS.map((suggestion) => (
              <div key={suggestion} className="h-24 skeleton" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
