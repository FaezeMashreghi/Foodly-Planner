import { useId } from 'react'
import { UnavailableSuggestions } from '@/components/weekly-plan/unavailable-suggestions/unavailable-suggestions'
import type { UnavailableSuggestionsState } from '@/components/weekly-plan/week-planner/week-view'

export function SuggestionsPlaceholder({
  suggestions,
}: {
  suggestions: UnavailableSuggestionsState
}) {
  const headingId = useId()

  return (
    <aside aria-labelledby={headingId} className="sticky top-4 space-y-3 self-start card">
      <h2 id={headingId} className="text-heading">
        Suggestions
      </h2>
      <UnavailableSuggestions suggestions={suggestions} />
    </aside>
  )
}
