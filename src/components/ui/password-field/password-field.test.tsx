import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@/test/axe'
import { PasswordField } from './password-field'

describe('PasswordField', () => {
  it('shows and hides the password, and tells screen reader users which it is', async () => {
    const user = userEvent.setup()
    render(<PasswordField label="Password" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    expect(screen.getByRole('status')).toHaveTextContent('Your password is hidden')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('status')).toHaveTextContent('Your password is visible')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('keeps what was typed and keeps focus on the button', async () => {
    const user = userEvent.setup()
    render(<PasswordField label="Password" />)

    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Show password' }))

    expect(screen.getByLabelText('Password')).toHaveValue('secret123')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveFocus()
  })

  it('has no accessibility problems found by axe', async () => {
    const { container } = render(
      <PasswordField label="Password" hint="At least 8 characters" error="Enter your password" />,
    )
    await expectNoAxeViolations(container)
  })
})
