import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as renderUi, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Meal } from '@shared/meal/meal'
import { MealDetailsButton } from './meal-details-button'

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
  it('names the button after the meal', () => {
    render(<MealDetailsButton meal={meal} />)
    expect(screen.getByRole('button', { name: 'Recipe for Ghormeh sabzi' })).toBeInTheDocument()
  })

  it('opens the meal details with its ingredients', async () => {
    const user = userEvent.setup()
    render(<MealDetailsButton meal={meal} />)
    await user.click(screen.getByRole('button', { name: 'Recipe for Ghormeh sabzi' }))

    const dialog = screen.getByRole('dialog', { name: 'Ghormeh sabzi' })
    expect(dialog).toHaveTextContent('Ingredients (2 servings)')
    expect(dialog).toHaveTextContent('300 g Beef stew meat')
    expect(dialog).toHaveTextContent('3 × Dried lime')
  })

  it('links to a YouTube search for the meal, in a new tab', async () => {
    const user = userEvent.setup()
    render(<MealDetailsButton meal={meal} />)
    await user.click(screen.getByRole('button', { name: 'Recipe for Ghormeh sabzi' }))

    const link = screen.getByRole('link', { name: /watch how to make it on youtube/i })
    expect(link).toHaveAttribute(
      'href',
      'https://www.youtube.com/results?search_query=Ghormeh%20sabzi%20recipe',
    )
    expect(link).toHaveAttribute('target', '_blank')
  })
})
