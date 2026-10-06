import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Dialog } from './dialog'

function Example() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Ghormeh sabzi">
        <p>Herb stew</p>
      </Dialog>
    </>
  )
}

describe('Dialog', () => {
  it('is closed until opened', () => {
    render(<Example />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens, named by its title', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    const dialog = screen.getByRole('dialog', { name: 'Ghormeh sabzi' })
    expect(dialog).toHaveTextContent('Herb stew')
  })

  it('closes with the Close button', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
