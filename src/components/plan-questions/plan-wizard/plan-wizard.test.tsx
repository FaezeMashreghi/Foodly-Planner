import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlanWizard } from './plan-wizard'
import { PLAN_QUESTIONS } from './questions'

const [first, second, , last] = PLAN_QUESTIONS

describe('PlanWizard', () => {
  it('shows the first question as the label of the answer box, with the progress', () => {
    render(<PlanWizard onDone={() => {}} />)
    const box = screen.getByRole('textbox', { name: first.text })
    expect(box).toHaveAccessibleDescription(`Question 1 of 4 ${first.hint}`)
    expect(box).not.toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('makes a new line with Enter, and moves on with Ctrl+Enter to the next question', async () => {
    const user = userEvent.setup()
    render(<PlanWizard onDone={() => {}} />)

    const box = screen.getByRole('textbox', { name: first.text })
    await user.type(box, 'Spinach{Enter}tomatoes')
    expect(box).toHaveValue('Spinach\ntomatoes')

    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(screen.getByRole('textbox', { name: second.text })).toHaveFocus()
    expect(screen.getByText('Question 2 of 4')).toBeInTheDocument()
  })

  it('keeps the answer when going back to change it', async () => {
    const user = userEvent.setup()
    render(<PlanWizard onDone={() => {}} />)

    await user.type(screen.getByRole('textbox', { name: first.text }), 'Spinach')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    const box = screen.getByRole('textbox', { name: first.text })
    expect(box).toHaveValue('Spinach')
    expect(box).toHaveFocus()
  })

  it('hands over all answers after the last question, empty ones included', async () => {
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<PlanWizard onDone={onDone} />)

    await user.type(screen.getByRole('textbox', { name: first.text }), 'Spinach')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.type(screen.getByRole('textbox', { name: last.text }), 'Ghormeh sabzi')
    await user.click(screen.getByRole('button', { name: 'Find meals' }))

    expect(onDone).toHaveBeenCalledWith({ expiring: 'Spinach', mustHave: 'Ghormeh sabzi' })
  })

  it('starts from the given answers', () => {
    render(<PlanWizard initialAnswers={{ expiring: 'Spinach' }} onDone={() => {}} />)
    expect(screen.getByRole('textbox', { name: first.text })).toHaveValue('Spinach')
  })
})
