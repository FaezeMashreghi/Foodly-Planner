import type { UnavailableSuggestionsState } from '@/components/weekly-plan/week-view'

export function UnavailableSuggestions({
  suggestions,
}: {
  suggestions: UnavailableSuggestionsState
}) {
  if (suggestions.status === 'pending') {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Loading suggestions…
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p role="alert" className="text-sm text-danger">
        Couldn't load suggestions.
      </p>
      <button type="button" className="btn-secondary" onClick={suggestions.retry}>
        Try again
      </button>
    </div>
  )
}
