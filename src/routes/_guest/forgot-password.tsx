import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_guest/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return <h1>please update your password</h1>
}
