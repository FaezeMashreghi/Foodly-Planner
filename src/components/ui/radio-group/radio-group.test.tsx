import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { RadioGroup } from './radio-group'

const options = [
  { value: 'tea', label: 'Tea' },
  { value: 'coffee', label: 'Coffee' },
] as const

function Drink() {
  const [drink, setDrink] = useState<'tea' | 'coffee'>('tea')
  return (
    <RadioGroup
      legend="What would you like to drink?"
      hint="You can change it later."
      options={options}
      value={drink}
      onChange={setDrink}
    />
  )
}

describe('RadioGroup', () => {
  it('is a group named by its legend and described by its hint', () => {
    render(<Drink />)

    const group = screen.getByRole('group', { name: 'What would you like to drink?' })
    expect(group).toHaveAccessibleDescription('You can change it later.')
    expect(screen.getByRole('radio', { name: 'Tea' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Coffee' })).not.toBeChecked()
  })

  it('chooses an option by clicking its label', async () => {
    const user = userEvent.setup()
    render(<Drink />)

    await user.click(screen.getByText('Coffee'))

    expect(screen.getByRole('radio', { name: 'Coffee' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Tea' })).not.toBeChecked()
  })

  it('moves between options with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Drink />)

    await user.tab()
    expect(screen.getByRole('radio', { name: 'Tea' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('radio', { name: 'Coffee' })).toHaveFocus()
    expect(screen.getByRole('radio', { name: 'Coffee' })).toBeChecked()
  })
})
