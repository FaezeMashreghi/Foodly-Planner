import { Link, createFileRoute } from '@tanstack/react-router'
import { SignInForm } from '@/components/auth/sign-in-form/sign-in-form'

export const Route = createFileRoute('/_guest/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <>
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
