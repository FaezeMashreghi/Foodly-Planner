import { Link } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { PasswordField } from '../../ui/password-field/password-field'
import { TextField } from '../../ui/text-field/text-field'

export function SignInForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Connected to Cognito in a later step.
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Email" type="email" name="email" autoComplete="username" required />

        <div className="space-y-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            required
          />
          <Link to="/forgot-password" className="text-sm link">
            Forgot your password?
          </Link>
        </div>

        <button type="submit" className="btn-primary w-full">
          Sign in
        </button>
      </form>

      <p className="text-ink-muted">
        New to Foodly?{' '}
        <Link to="/sign-up" className="link">
          Create an account
        </Link>
      </p>
    </>
  )
}
