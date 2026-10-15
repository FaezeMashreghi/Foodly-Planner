import { useState } from 'react'
import { dayOf, type Day } from '@shared/week-plan/week-plan'
import { Tabs, type Tab } from '@/components/ui/tabs/tabs'
import { DaySection } from '@/components/weekly-plan/day-section/day-section'
import type { WeekViewProps } from '@/components/weekly-plan/week-planner/week-view'

export function WeekDayTabs({ days, ...dayProps }: WeekViewProps) {
  const [selectedDay, setSelectedDay] = useState<Day>(() => dayOf(new Date()))
  const dayTabs: Tab<Day>[] = days.map((day) => ({
    id: day,
    label: day,
    shortLabel: day.slice(0, 3),
  }))

  return (
    <Tabs
      label="Day"
      tabs={dayTabs}
      selectedId={selectedDay}
      onSelect={setSelectedDay}
      tabListClassName="sticky top-0 z-10 bg-canvas py-2"
    >
      <DaySection day={selectedDay} {...dayProps} />
    </Tabs>
  )
}
