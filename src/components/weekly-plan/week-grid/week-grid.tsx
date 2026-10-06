import { useState } from 'react'
import type { Meal } from '@shared/meal/meal'
import { dayOf, type Day, type PlanSlots } from '@shared/week-plan/week-plan'
import { Tabs, type Tab } from '@/components/ui/tabs/tabs'
import { DaySection } from '@/components/weekly-plan/day-section/day-section'
import { useMediaQuery } from '@/hooks/use-media-query'

type WeekGridProps = {
  /** The plan's days in order, from its start day. */
  days: Day[]
  slots: PlanSlots
  mealsById: Map<string, Meal>
  className?: string
}

export function WeekGrid({ days, slots, mealsById, className = '' }: WeekGridProps) {
  const isLargeScreen = useMediaQuery('(min-width: 64rem)')
  const [selectedDay, setSelectedDay] = useState<Day>(() => dayOf(new Date()))
  const dayTabs: Tab<Day>[] = days.map((day) => ({
    id: day,
    label: day,
    shortLabel: day.slice(0, 3),
  }))

  if (!isLargeScreen) {
    return (
      <div className={className}>
        <Tabs label="Day" tabs={dayTabs} selectedId={selectedDay} onSelect={setSelectedDay}>
          <DaySection day={selectedDay} slots={slots} mealsById={mealsById} />
        </Tabs>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {days.map((day) => (
        <DaySection key={day} day={day} slots={slots} mealsById={mealsById} />
      ))}
    </div>
  )
}
