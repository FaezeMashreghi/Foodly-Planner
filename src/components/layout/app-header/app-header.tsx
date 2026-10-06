import { Link } from '@tanstack/react-router'
import { signOut } from '@/api/auth/session'
import { AppLogo } from '@/components/ui/app-logo/app-logo'
import { ROUTES, NAV_LINKS } from '@/lib/routes'

export function AppHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 px-4 py-2">
        <Link to={ROUTES.weeklyPlan} className="flex min-h-11 items-center">
          <AppLogo />
        </Link>

        <nav aria-label="Main" className="order-last w-full sm:order-none sm:w-auto">
          <ul role="list" className="flex gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="flex min-h-11 items-center rounded-control px-3 font-semibold text-ink-muted hover:bg-canvas aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button type="button" className="btn-secondary" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    </header>
  )
}
