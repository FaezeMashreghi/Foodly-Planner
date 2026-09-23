import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_guest/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return <h1 className="text-title">Sign in</h1>
}
