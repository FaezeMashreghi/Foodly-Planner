import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { validateConfirmationCode } from '@shared/validation/confirmation-code/confirmation-code'
import { validateNewPassword } from '@shared/validation/password/password'
import { confirmForgotPassword, forgotPassword } from '@/api/auth/cognito'
import { getAuthErrorMessage } from '@/api/auth/errors'
import { useForm } from '@/hooks/use-form'
import { FormError } from '@/components/ui/form-error/form-error'
import { PasswordField } from '@/components/ui/password-field/password-field'
import { TextField } from '@/components/ui/text-field/text-field'

export function ResetPasswordForm({ email }: { email: string }) {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string>()
  const [status, setStatus] = useState('')

  const form = useForm({
    initialValues: { code: '', password: '' },
    validate: { code: validateConfirmationCode, password: validateNewPassword },
    onSubmit: async ({ code, password }) => {
      setFormError(undefined)
      try {
        await confirmForgotPassword(email, code.replace(/\s/g, ''), password)
        await navigate({ to: '/sign-in', search: { notice: 'password-reset' } })
      } catch (error) {
        setFormError(getAuthErrorMessage(error))
      }
    },
  })

  async function resendCode() {
    setFormError(undefined)
    setStatus('')
    try {
      await forgotPassword(email)
      setStatus(`We sent a new code to ${email}.`)
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  }

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <FormError message={formError} />

      <TextField
        label="Code"
        hint="It's in the email we sent you. Check your spam folder too."
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        {...form.field('code')}
      />

      <PasswordField
        label="New password"
        autoComplete="new-password"
        hint="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol."
        required
        {...form.field('password')}
      />

      <button type="submit" className="btn-primary w-full">
        {form.submitting ? 'Saving…' : 'Save new password'}
      </button>

      <p className="text-sm text-ink-muted">
        Didn't get it?{' '}
        <button type="button" onClick={resendCode} className="link">
          Send a new code
        </button>
      </p>
      <p role="status" className="text-sm text-ink">
        {status}
      </p>
    </form>
  )
}
