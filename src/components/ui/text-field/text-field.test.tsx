import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TextField } from './text-field'

describe('TextField', () => {
  it('links the label to the input', () => {
    render(<TextField label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('reads the hint and the error as the input description', () => {
    render(<TextField label="Email" hint="We'll send a code" error="Enter a valid email address" />)
    const input = screen.getByLabelText('Email')
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription(
      "We'll send a code Error: Enter a valid email address",
    )
  })

  it('is not marked invalid without an error', () => {
    render(<TextField label="Email" />)
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
  })

  it('lets the user type', async () => {
    const user = userEvent.setup()
    render(<TextField label="Email" />)
    await user.type(screen.getByLabelText('Email'), 'faeze@example.com')
    expect(screen.getByLabelText('Email')).toHaveValue('faeze@example.com')
  })
})
