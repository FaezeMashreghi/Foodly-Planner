import { Link } from '@tanstack/react-router'
import { signOut } from '@/api/auth/session'

export function AppHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <Link to="/" className="flex min-h-11 items-center text-heading text-brand">
          Foodly
        </Link>
        <button type="button" className="btn-secondary" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    </header>
  )
}
