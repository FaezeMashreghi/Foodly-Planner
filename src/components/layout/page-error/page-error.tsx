import { useRouter } from '@tanstack/react-router'
import { useFocusOnMount } from '@/hooks/use-focus-on-mount'

export function PageError() {
  const router = useRouter()
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  function handleRetry() {
    void router.invalidate()
  }

  return (
    <div className="mx-auto max-w-md space-y-4 card">
      <h1 ref={headingRef} tabIndex={-1} className="text-title">
        Something went wrong
      </h1>
      <p className="text-ink-muted">
        We couldn't load this page. Check your connection and try again.
      </p>
      <button type="button" className="btn-primary" onClick={handleRetry}>
        Try again
      </button>
    </div>
  )
}
