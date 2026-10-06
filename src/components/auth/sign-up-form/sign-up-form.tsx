import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { validateEmail } from '@shared/validation/email/email'
import { validateNewPassword } from '@shared/validation/password/password'
import { signUp } from '@/api/auth/cognito'
import { getAuthErrorMessage } from '@/api/auth/errors'
import { useForm } from '@/hooks/use-form'
import { FormError } from '@/components/ui/form-error/form-error'
import { PasswordField } from '@/components/ui/password-field/password-field'
import { TextField } from '@/components/ui/text-field/text-field'
import { ROUTES } from '@/lib/routes'

export function SignUpForm() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string>()

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: { email: validateEmail, password: validateNewPassword },
    onSubmit: async ({ email, password }) => {
      setFormError(undefined)
      try {
        await signUp(email.trim(), password)
        await navigate({ to: ROUTES.confirmEmail, search: { email: email.trim() } })
      } catch (error) {
        setFormError(getAuthErrorMessage(error))
      }
    },
  })

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <FormError message={formError} />

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        hint="We'll send you a code to confirm it."
        required
        {...form.field('email')}
      />

      <PasswordField
        label="Password"
        autoComplete="new-password"
        hint="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol."
        required
        {...form.field('password')}
      />

      <button type="submit" className="btn-primary w-full">
        {form.submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
