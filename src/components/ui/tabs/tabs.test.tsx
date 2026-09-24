import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Tabs, type Tab } from './tabs'

type Fruit = 'apple' | 'banana' | 'cherry'

const FRUITS: Tab<Fruit>[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana', shortLabel: 'Ban' },
  { id: 'cherry', label: 'Cherry' },
]

function Example() {
  const [fruit, setFruit] = useState<Fruit>('apple')
  return (
    <Tabs label="Fruit" tabs={FRUITS} selectedId={fruit} onSelect={setFruit}>
      <p>{fruit} content</p>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('names the tab list and shows the selected tab in the panel', () => {
    render(<Example />)
    expect(screen.getByRole('tablist', { name: 'Fruit' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Apple' })).toHaveTextContent('apple content')
  })

  it('shows the short label but keeps the full label as the name', () => {
    render(<Example />)
    expect(screen.getByRole('tab', { name: 'Banana' })).toHaveTextContent('Ban')
  })

  it('selects a tab on click', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('tab', { name: 'Cherry' }))
    expect(screen.getByRole('tabpanel', { name: 'Cherry' })).toHaveTextContent('cherry content')
  })

  it('puts only the selected tab in the Tab order', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.tab()
    expect(screen.getByRole('tab', { name: 'Apple' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('tab', { name: 'Banana' })).not.toHaveFocus()
  })

  it('moves with the arrow keys and wraps around', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('tab', { name: 'Apple' }))

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Banana' })).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('banana content')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Cherry' })).toHaveFocus()
  })

  it('jumps to the first and last tab with Home and End', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('tab', { name: 'Banana' }))

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Cherry' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Apple' })).toHaveFocus()
  })
})
