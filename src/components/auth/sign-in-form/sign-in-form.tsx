import { Link } from '@tanstack/react-router'
import { validateEmail } from '@shared/validation/email/email'
import { validateCurrentPassword } from '@shared/validation/password/password'
import { useForm } from '@/hooks/use-form'
import { PasswordField } from '@/components/ui/password-field/password-field'
import { TextField } from '@/components/ui/text-field/text-field'

export function SignInForm() {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: { email: validateEmail, password: validateCurrentPassword },
    onSubmit: async () => {
      // Connected to Cognito in a later step.
    },
  })

  // noValidate: our own accessible messages replace the browser's pop-ups.
  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
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
        Sign in
      </button>
    </form>
  )
}
