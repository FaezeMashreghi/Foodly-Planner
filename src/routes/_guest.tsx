import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { safeRedirect } from '@/lib/safe-redirect'

export const Route = createFileRoute('/_guest')({
  beforeLoad: ({ context, location }) => {
    if (context.auth.getUser()) {
      const search = location.search as { redirect?: unknown }
      throw redirect({ href: safeRedirect(search.redirect) ?? '/' })
    }
  },
  component: GuestLayout,
})

function GuestLayout() {
  return (
    <div className="flex min-h-dvh items-start justify-center auth-background px-4 py-8 sm:items-center lg:justify-start lg:px-16 xl:px-24">
      <main className="w-full max-w-md space-y-6 card sm:p-8">
        {/* App name only; each page renders its own <h1>. */}
        <p className="text-heading text-brand">Foodly</p>
        <Outlet />
      </main>
    </div>
  )
}
