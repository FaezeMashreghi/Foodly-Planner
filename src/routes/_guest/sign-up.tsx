import { Link, createFileRoute } from '@tanstack/react-router'
import { SignUpForm } from '@/components/auth/sign-up-form/sign-up-form'

export const Route = createFileRoute('/_guest/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-title">Create your account</h1>
        <p className="text-ink-muted">Get meal ideas you'll love and plan your week in minutes.</p>
      </div>

      <SignUpForm />

      <p className="text-ink-muted">
        Already have an account?{' '}
        <Link to="/sign-in" className="link">
          Sign in
        </Link>
      </p>
    </>
  )
}
