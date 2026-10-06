import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Recipe } from '@shared/meal/meal'
import { expectNoAxeViolations } from '@/test/axe'
import { MealRecipe } from './meal-recipe'

const client = vi.hoisted(() => ({ apiFetch: vi.fn() }))
vi.mock('@/api/foodly/client', () => client)

const recipe: Recipe = {
  extras: ['1 tsp turmeric'],
  steps: ['Fry the herbs.', 'Add the meat and simmer for 2 hours.'],
  tips: ['Tastes better the next day.'],
  model: 'test',
  createdAt: '2026-09-28T00:00:00Z',
}

function renderRecipe() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MealRecipe mealId="ghormeh-sabzi" />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MealRecipe', () => {
  it('does not ask for a recipe until the user does', () => {
    renderRecipe()
    expect(screen.getByRole('button', { name: 'Get recipe' })).toBeInTheDocument()
    expect(client.apiFetch).not.toHaveBeenCalled()
  })

  it('announces loading, then shows the recipe and moves focus to it', async () => {
    let finish: (value: Recipe) => void = () => {}
    client.apiFetch.mockReturnValue(new Promise<Recipe>((resolve) => (finish = resolve)))
    const user = userEvent.setup()
    renderRecipe()

    await user.click(screen.getByRole('button', { name: 'Get recipe' }))
    expect(screen.getByRole('status')).toHaveTextContent('Writing the recipe')
    expect(client.apiFetch).toHaveBeenCalledWith('/meals/ghormeh-sabzi/recipe', { method: 'POST' })

    finish(recipe)
    const heading = await screen.findByRole('heading', { name: 'Recipe' })
    expect(heading).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('')
    expect(screen.getByText('1 tsp turmeric')).toBeInTheDocument()
    expect(screen.getByText('Fry the herbs.')).toBeInTheDocument()
    expect(screen.getByText(/written by ai/i)).toBeInTheDocument()
  })

  it('shows an error that can be retried', async () => {
    // Fails twice: the first try and the one automatic retry.
    client.apiFetch
      .mockRejectedValueOnce(new Error('500'))
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValueOnce(recipe)
    const user = userEvent.setup()
    renderRecipe()

    await user.click(screen.getByRole('button', { name: 'Get recipe' }))
    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(
      "Couldn't load the recipe",
    )

    await user.click(screen.getByRole('button', { name: 'Get recipe' }))
    expect(await screen.findByRole('heading', { name: 'Recipe' })).toBeInTheDocument()
  })

  it('has no accessibility problems found by axe with a recipe shown', async () => {
    client.apiFetch.mockResolvedValue(recipe)
    const user = userEvent.setup()
    const { container } = renderRecipe()
    await user.click(screen.getByRole('button', { name: 'Get recipe' }))
    await screen.findByText('Fry the herbs.')
    await expectNoAxeViolations(container)
  })
})
