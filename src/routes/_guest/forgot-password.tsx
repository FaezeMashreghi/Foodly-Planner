import { Link, createFileRoute } from '@tanstack/react-router'
import { RequestResetForm } from '@/components/auth/request-reset-form/request-reset-form'
import { ResetPasswordForm } from '@/components/auth/reset-password-form/reset-password-form'

export const Route = createFileRoute('/_guest/forgot-password')({
  validateSearch: (search): { email?: string } => ({
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { email } = Route.useSearch()

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-title">Reset your password</h1>
        <p className="text-ink-muted">
          {email
            ? `If ${email} has an account, we sent a 6-digit code to it. Enter it with your new password.`
            : "Enter your email and we'll send you a code to reset your password."}
        </p>
      </div>

      {email ? <ResetPasswordForm email={email} /> : <RequestResetForm />}

      <p className="text-ink-muted">
        <Link to="/sign-in" className="link">
          Back to sign in
        </Link>
      </p>
    </>
  )
}
