import { Link, createFileRoute } from '@tanstack/react-router'
import { SignInForm } from '@/components/auth/sign-in-form/sign-in-form'
import { safeRedirect } from '@/lib/safe-redirect'

type Notice = 'confirmed' | 'password-reset'

const noticeMessages: Record<Notice, string> = {
  confirmed: 'Your email is confirmed. Sign in to continue.',
  'password-reset': 'Your password has been reset. Sign in with your new password.',
}

export const Route = createFileRoute('/_guest/sign-in')({
  validateSearch: (search): { redirect?: string; notice?: Notice } => ({
    redirect: safeRedirect(search.redirect),
    notice:
      search.notice === 'confirmed' || search.notice === 'password-reset'
        ? search.notice
        : undefined,
  }),
  component: SignInPage,
})

function SignInPage() {
  const { notice } = Route.useSearch()

  return (
    <>
      {notice && (
        <p role="status" className="rounded-control bg-brand-soft px-3 py-2 text-sm text-ink">
          {noticeMessages[notice]}
        </p>
      )}
      <div className="space-y-2">
        <h1 className="text-title">Sign in</h1>
        <p className="text-ink-muted">Welcome back. Plan your meals for the week.</p>
      </div>

      <SignInForm />

      <p className="text-ink-muted">
        New to Foodly?{' '}
        <Link to="/sign-up" className="link">
          Create an account
        </Link>
      </p>
    </>
  )
}
