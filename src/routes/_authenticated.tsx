import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppHeader } from '@/components/layout/app-header/app-header'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    // Refreshes an expired access token, or signs out if the session is dead.
    if (!(await context.auth.getAccessToken())) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </>
  )
}
