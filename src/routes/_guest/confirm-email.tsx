import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_guest/confirm-email')({
  component: ConfirmPasswordPage,
})

function ConfirmPasswordPage() {
  return <h1>please confirm your password</h1>
}
