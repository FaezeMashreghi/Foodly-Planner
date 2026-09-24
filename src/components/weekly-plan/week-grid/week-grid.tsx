import { useState } from 'react'
import { DAYS, dayOf, type Day, type WeekPlan } from '@shared/week-plan/week-plan'
import { Tabs, type Tab } from '@/components/ui/tabs/tabs'
import { DaySection } from '@/components/weekly-plan/day-section/day-section'
import { useMediaQuery } from '@/hooks/use-media-query'

const DAY_TABS: Tab<Day>[] = DAYS.map((day) => ({
  id: day,
  label: day,
  shortLabel: day.slice(0, 3),
}))

type WeekGridProps = {
  plan: WeekPlan
  className?: string
}

export function WeekGrid({ plan, className = '' }: WeekGridProps) {
  const isLargeScreen = useMediaQuery('(min-width: 64rem)')
  const [selectedDay, setSelectedDay] = useState<Day>(() => dayOf(new Date()))

  if (!isLargeScreen) {
    return (
      <div className={className}>
        <Tabs label="Day" tabs={DAY_TABS} selectedId={selectedDay} onSelect={setSelectedDay}>
          <DaySection day={selectedDay} plan={plan} />
        </Tabs>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {DAYS.map((day) => (
        <DaySection key={day} day={day} plan={plan} />
      ))}
    </div>
  )
}
