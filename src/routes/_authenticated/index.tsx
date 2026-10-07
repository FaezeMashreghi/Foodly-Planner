import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/lib/routes'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.planQuestions, replace: true })
  },
})
