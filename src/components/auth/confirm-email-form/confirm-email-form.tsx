import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { validateConfirmationCode } from '@shared/validation/confirmation-code/confirmation-code'
import { validateEmail } from '@shared/validation/email/email'
import { confirmSignUp, resendConfirmationCode } from '@/api/auth/cognito'
import { AuthErrorName, getAuthErrorMessage, isAuthError } from '@/api/auth/errors'
import { useForm } from '@/hooks/use-form'
import { FormError } from '@/components/ui/form-error/form-error'
import { TextField } from '@/components/ui/text-field/text-field'

export function ConfirmEmailForm({ email: knownEmail }: { email?: string }) {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string>()
  const [status, setStatus] = useState('')

  const goToSignIn = () => navigate({ to: '/sign-in', search: { notice: 'confirmed' } })

  const form = useForm({
    initialValues: { email: knownEmail ?? '', code: '' },
    validate: { email: validateEmail, code: validateConfirmationCode },
    onSubmit: async ({ email, code }) => {
      setFormError(undefined)
      try {
        await confirmSignUp(email.trim(), code.replace(/\s/g, ''))
        await goToSignIn()
      } catch (error) {
        // Cognito answers NotAuthorized when the account is already confirmed.
        if (isAuthError(error, AuthErrorName.NotAuthorized)) return goToSignIn()
        setFormError(getAuthErrorMessage(error))
      }
    },
  })

  async function resendCode() {
    const email = form.values.email.trim()
    const emailError = validateEmail(email)
    if (emailError) {
      setFormError(emailError)
      return
    }
    setFormError(undefined)
    setStatus('')
    try {
      await resendConfirmationCode(email)
      setStatus(`We sent a new code to ${email}.`)
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  }

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <FormError message={formError} />

      {!knownEmail && (
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          {...form.field('email')}
        />
      )}

      <TextField
        label="Confirmation code"
        hint="It's in the email we sent you. Check your spam folder too."
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        {...form.field('code')}
      />

      <button type="submit" className="btn-primary w-full">
        {form.submitting ? 'Confirming…' : 'Confirm'}
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
