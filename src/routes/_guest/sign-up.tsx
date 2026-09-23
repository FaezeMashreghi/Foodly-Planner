import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_guest/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return <h1>Create your account</h1>
}
