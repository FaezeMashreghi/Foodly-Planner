import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@/test/axe'
import { ExtractErrorScreen } from './extract-error-screen'

describe('ExtractErrorScreen', () => {
  it('announces the error and lets the user try again', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ExtractErrorScreen dailyLimitReached={false} onEdit={vi.fn()} onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't read your answers.")
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('explains the daily limit and offers no retry', () => {
    render(<ExtractErrorScreen dailyLimitReached onEdit={vi.fn()} onRetry={vi.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent("You've reached today's limit")
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change my answers' })).toBeInTheDocument()
  })

  it('has no accessibility problems found by axe', async () => {
    const { container } = render(
      <ExtractErrorScreen dailyLimitReached={false} onEdit={vi.fn()} onRetry={vi.fn()} />,
    )
    await expectNoAxeViolations(container)
  })
})
