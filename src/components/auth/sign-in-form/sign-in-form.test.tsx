import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthErrorName } from '@/api/auth/errors'
import { ROUTES } from '@/lib/routes'
import { expectNoAxeViolations } from '@/test/axe'
import { SignInForm } from './sign-in-form'

const session = vi.hoisted(() => ({ signIn: vi.fn() }))
vi.mock('@/api/auth/session', () => session)

// No real router in a component test: Link becomes a plain link, navigate a spy.
const navigate = vi.hoisted(() => vi.fn())
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  Link: ({ to, className, children }: { to: string; className?: string; children: ReactNode }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

function authError(name: string) {
  const error = new Error(name)
  error.name = name
  return error
}

async function fillIn(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  return user
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SignInForm', () => {
  it('on an empty submit, shows each error on its field and focuses the first one', async () => {
    const user = userEvent.setup()
    render(<SignInForm />)

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const email = screen.getByRole('textbox', { name: 'Email' })
    expect(email).toHaveFocus()
    expect(email).toBeInvalid()
    expect(email).toHaveAccessibleDescription('Error: Enter your email address')
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Error: Enter your password',
    )
    expect(session.signIn).not.toHaveBeenCalled()
  })

  it('signs in with the email and password', async () => {
    session.signIn.mockResolvedValue({})
    render(<SignInForm />)
    const user = await fillIn('faeze@example.com', 'Secret123!')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(session.signIn).toHaveBeenCalledWith('faeze@example.com', 'Secret123!')
  })

  it('announces a wrong email or password as an alert', async () => {
    session.signIn.mockRejectedValue(authError(AuthErrorName.NotAuthorized))
    render(<SignInForm />)
    const user = await fillIn('faeze@example.com', 'wrong')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
  })

  it('sends a user who has not confirmed their email to the confirm page', async () => {
    session.signIn.mockRejectedValue(authError(AuthErrorName.UserNotConfirmed))
    render(<SignInForm />)
    const user = await fillIn(' faeze@example.com ', 'Secret123!')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(navigate).toHaveBeenCalledWith({
      to: ROUTES.confirmEmail,
      search: { email: 'faeze@example.com' },
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('has no accessibility problems found by axe with errors shown', async () => {
    const user = userEvent.setup()
    const { container } = render(<SignInForm />)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await expectNoAxeViolations(container)
  })
})
