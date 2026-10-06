import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as renderUi, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Meal } from '@shared/meal/meal'
import { expectNoAxeViolations } from '@/test/axe'
import { MealDetailsButton } from './meal-details-button'

// The recipe is only fetched on request; the mock keeps Cognito and the backend out of the test.
vi.mock('@/api/foodly/client', () => ({ apiFetch: vi.fn() }))

const meal: Meal = {
  id: 'ghormeh-sabzi',
  name: 'Ghormeh sabzi',
  emoji: '🌿',
  mealTypes: ['Lunch', 'Dinner'],
  cuisine: 'persian',
  difficulty: 'medium',
  prepMinutes: 180,
  servings: 2,
  ingredients: [
    { ingredientId: 'beef-stew-meat', amount: 300, unit: 'g' },
    { ingredientId: 'dried-lime', amount: 3, unit: 'piece' },
  ],
  source: 'seed',
}

function render(ui: React.ReactElement) {
  return renderUi(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>)
}

describe('MealDetailsButton', () => {
  it('opens the meal details with its ingredients', async () => {
    const user = userEvent.setup()
    render(<MealDetailsButton meal={meal} />)
    await user.click(screen.getByRole('button', { name: 'Recipe for Ghormeh sabzi' }))

    const dialog = screen.getByRole('dialog', { name: 'Ghormeh sabzi' })
    expect(dialog).toHaveTextContent('Ingredients (2 servings)')
    expect(dialog).toHaveTextContent('300 g Beef stew meat')
    expect(dialog).toHaveTextContent('3 × Dried lime')
  })

  it('has no accessibility problems found by axe when open', async () => {
    const user = userEvent.setup()
    const { baseElement } = render(<MealDetailsButton meal={meal} />)
    await user.click(screen.getByRole('button', { name: 'Recipe for Ghormeh sabzi' }))
    // The dialog is portaled to <body>, outside the render container.
    await expectNoAxeViolations(baseElement)
  })
})
