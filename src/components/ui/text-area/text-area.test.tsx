import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@/test/axe'
import { TextArea } from './text-area'

describe('TextArea', () => {
  it('links the label, hint and error to the box', () => {
    render(<TextArea label="Your answer" hint="A few words" error="Too long" />)
    const box = screen.getByRole('textbox', { name: 'Your answer' })
    expect(box).toBeInvalid()
    expect(box).toHaveAccessibleDescription('A few words Error: Too long')
  })

  it('makes a new line with Enter', async () => {
    const user = userEvent.setup()
    render(<TextArea label="Your answer" />)
    await user.type(screen.getByRole('textbox', { name: 'Your answer' }), 'spinach{Enter}tomatoes')
    expect(screen.getByRole('textbox', { name: 'Your answer' })).toHaveValue('spinach\ntomatoes')
  })

  it('counts the characters against the limit', async () => {
    function Example() {
      const [value, setValue] = useState('')
      return (
        <TextArea
          label="Your answer"
          maxLength={450}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )
    }
    const user = userEvent.setup()
    render(<Example />)
    expect(screen.getByText('0 / 450')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Your answer' }), 'spinach')
    expect(screen.getByText('7 / 450')).toBeInTheDocument()
  })

  it('has no accessibility problems found by axe', async () => {
    const { container } = render(
      <TextArea label="Your answer" hint="A few words" error="Too long" maxLength={450} />,
    )
    await expectNoAxeViolations(container)
  })
})
