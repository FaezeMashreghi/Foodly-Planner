import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_guest')({
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
