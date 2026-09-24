import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { validateEmail } from '@shared/validation/email/email'
import { validateCurrentPassword } from '@shared/validation/password/password'
import { AuthErrorName, getAuthErrorMessage, isAuthError } from '@/api/auth/errors'
import { signIn } from '@/api/auth/session'
import { useForm } from '@/hooks/use-form'
import { FormError } from '@/components/ui/form-error/form-error'
import { PasswordField } from '@/components/ui/password-field/password-field'
import { TextField } from '@/components/ui/text-field/text-field'

export function SignInForm() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string>()

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: { email: validateEmail, password: validateCurrentPassword },
    onSubmit: async ({ email, password }) => {
      setFormError(undefined)
      try {
        // On success the _guest guard redirects, so there's nothing else to do here.
        await signIn(email, password)
      } catch (error) {
        if (isAuthError(error, AuthErrorName.UserNotConfirmed)) {
          await navigate({ to: '/confirm-email', search: { email: email.trim() } })
          return
        }
        setFormError(getAuthErrorMessage(error))
      }
    },
  })

  // noValidate: our own accessible messages replace the browser's pop-ups.
  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <FormError message={formError} />

      <TextField
        label="Email"
        type="email"
        autoComplete="username"
        required
        {...form.field('email')}
      />

      <div className="space-y-2">
        <PasswordField
          label="Password"
          autoComplete="current-password"
          required
          {...form.field('password')}
        />
        <Link to="/forgot-password" className="text-sm link">
          Forgot your password?
        </Link>
      </div>

      <button type="submit" className="btn-primary w-full">
        {form.submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
