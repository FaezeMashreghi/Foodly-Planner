import { FormError } from '@/components/ui/form-error/form-error'

type ExtractErrorScreenProps = {
  dailyLimitReached: boolean
  onEdit: () => void
  onRetry: () => void
}

export function ExtractErrorScreen({
  dailyLimitReached,
  onEdit,
  onRetry,
}: ExtractErrorScreenProps) {
  return (
    <div className="space-y-4 card">
      <FormError
        message={
          dailyLimitReached
            ? "You've reached today's limit for reading answers. Please come back tomorrow."
            : "We couldn't read your answers. Please try again."
        }
      />
      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={onEdit}>
          Change my answers
        </button>
        {!dailyLimitReached && (
          <button type="button" className="btn-primary" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
