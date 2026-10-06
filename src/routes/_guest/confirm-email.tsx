import { createFileRoute } from '@tanstack/react-router'
import { ConfirmEmailForm } from '@/components/auth/confirm-email-form/confirm-email-form'

export const Route = createFileRoute('/_guest/confirm-email')({
  validateSearch: (search): { email?: string } => ({
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  component: ConfirmEmailPage,
})

function ConfirmEmailPage() {
  const { email } = Route.useSearch()

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-title">Confirm your email</h1>
        <p className="text-ink-muted">
          {email
            ? `We sent a 6-digit code to ${email}.`
            : 'Enter your email and the 6-digit code we sent you.'}
        </p>
      </div>

      <ConfirmEmailForm email={email} />
    </>
  )
}
