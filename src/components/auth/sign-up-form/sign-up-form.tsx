import type { FormEvent } from 'react'
import { PasswordField } from '@/components/ui/password-field/password-field'
import { TextField } from '@/components/ui/text-field/text-field'

export function SignUpForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Connected to Cognito in a later step; then go to /confirm-email.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        hint="We'll send you a code to confirm it."
        required
      />

      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        hint="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol."
        required
      />

      <button type="submit" className="btn-primary w-full">
        Create account
      </button>
    </form>
  )
}
