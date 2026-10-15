import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Meal } from '@shared/meal/meal'
import { expectNoAxeViolations } from '@/test/axe'
import { MealPicker } from './meal-picker'

// Each card has a Recipe button; the mock keeps Cognito and the backend out of the test.
vi.mock('@/api/foodly/client', () => ({ apiFetch: vi.fn() }))

const porridge: Meal = {
  id: 'porridge',
  name: 'Porridge',
  emoji: '🥣',
  mealTypes: ['Breakfast'],
  cuisine: 'international',
  difficulty: 'easy',
  prepMinutes: 10,
  servings: 1,
  ingredients: [],
  source: 'seed',
}

const omelette: Meal = { ...porridge, id: 'omelette', name: 'Omelette', emoji: '🍳' }

describe('MealPicker', () => {
  it('reports the meal the user chooses', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<MealPicker meals={[porridge, omelette]} onPick={onPick} />)

    await user.click(screen.getByRole('button', { name: 'Choose Omelette' }))

    expect(onPick).toHaveBeenCalledWith(omelette)
  })

  it('says so when there is nothing to choose', () => {
    render(<MealPicker meals={[]} onPick={vi.fn()} />)

    expect(screen.getByText('No suggestions yet.')).toBeInTheDocument()
  })

  it('has no accessibility problems found by axe', async () => {
    const { container } = render(<MealPicker meals={[porridge, omelette]} onPick={vi.fn()} />)
    await expectNoAxeViolations(container)
  })
})
