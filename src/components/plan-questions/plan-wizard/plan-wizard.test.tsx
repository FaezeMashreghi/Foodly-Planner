import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@/test/axe'
import { PlanWizard } from './plan-wizard'
import { PLAN_QUESTIONS, type PlanAnswersText } from './questions'

const [first, second, , last] = PLAN_QUESTIONS

// The flow keeps the step in the URL; here a state stands in for it.
function Wizard({ onDone = vi.fn() }: { onDone?: (answers: PlanAnswersText) => void }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  return (
    <PlanWizard questionIndex={questionIndex} onQuestionChange={setQuestionIndex} onDone={onDone} />
  )
}

describe('PlanWizard', () => {
  it('after Next, shows the next question and moves focus to it', async () => {
    const user = userEvent.setup()
    render(<Wizard />)

    await user.click(screen.getByRole('button', { name: 'Next' }))

    const box = screen.getByRole('textbox', { name: second.text })
    expect(box).toHaveFocus()
    expect(box).toHaveAccessibleDescription(`Question 2 of 4 ${second.hint}`)
  })

  it('goes back with the answer kept, and focuses it', async () => {
    const user = userEvent.setup()
    render(<Wizard />)
    await user.type(screen.getByRole('textbox', { name: first.text }), 'spinach')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await user.click(screen.getByRole('button', { name: 'Back' }))

    const box = screen.getByRole('textbox', { name: first.text })
    expect(box).toHaveValue('spinach')
    expect(box).toHaveFocus()
  })

  it('finishes on the last question with "Find meals" and all the answers', async () => {
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<Wizard onDone={onDone} />)
    await user.type(screen.getByRole('textbox', { name: first.text }), 'spinach')
    for (let step = 0; step < PLAN_QUESTIONS.length - 1; step++) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }
    await user.type(screen.getByRole('textbox', { name: last.text }), 'ghormeh sabzi')

    await user.click(screen.getByRole('button', { name: 'Find meals' }))

    expect(onDone).toHaveBeenCalledWith({ expiring: 'spinach', mustHave: 'ghormeh sabzi' })
  })

  it('has no accessibility problems found by axe', async () => {
    const { container } = render(<Wizard />)
    await expectNoAxeViolations(container)
  })
})
