import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { validateEmail } from '@shared/validation/email/email'
import { forgotPassword } from '@/api/auth/cognito'
import { getAuthErrorMessage } from '@/api/auth/errors'
import { useForm } from '@/hooks/use-form'
import { FormError } from '@/components/ui/form-error/form-error'
import { TextField } from '@/components/ui/text-field/text-field'

export function RequestResetForm() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string>()

  const form = useForm({
    initialValues: { email: '' },
    validate: { email: validateEmail },
    onSubmit: async ({ email }) => {
      setFormError(undefined)
      try {
        await forgotPassword(email.trim())
        await navigate({ to: '/forgot-password', search: { email: email.trim() } })
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
        autoComplete="username"
        required
        {...form.field('email')}
      />

      <button type="submit" className="btn-primary w-full">
        {form.submitting ? 'Sending code…' : 'Send code'}
      </button>
    </form>
  )
}
