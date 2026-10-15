import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Meal } from '@shared/meal/meal'
import { apiFetch } from '@/api/foodly/client'
import { mealsQueryOptions } from '@/api/foodly/meals'
import { planQueryOptions, planSuggestionsQueryOptions } from '@/api/foodly/plan'
import { useMediaQuery } from '@/hooks/use-media-query'
import { expectNoAxeViolations } from '@/test/axe'
import { WeekPlanner } from './week-planner'

vi.mock('@/api/foodly/client', () => ({ apiFetch: vi.fn() }))
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: vi.fn() }))

const WEEK_START = '2026-10-12'

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

const SUGGESTIONS = { Breakfast: ['porridge'], Lunch: [], Dinner: ['porridge'] }

function renderPlanner({ withSuggestions = true } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(mealsQueryOptions.queryKey, [porridge])
  queryClient.setQueryData(planQueryOptions(WEEK_START).queryKey, {
    weekStart: WEEK_START,
    slots: { 'Monday Breakfast': 'porridge' },
  })
  if (withSuggestions) {
    queryClient.setQueryData(planSuggestionsQueryOptions(WEEK_START).queryKey, SUGGESTIONS)
  }
  return render(
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <WeekPlanner weekStart={WEEK_START} />
      </Suspense>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('WeekPlanner on a small screen', () => {
  beforeEach(() => {
    vi.mocked(useMediaQuery).mockReturnValue(false)
  })

  it('shows the week when suggestions fail, and loads them on Try again', async () => {
    const user = userEvent.setup()
    vi.mocked(apiFetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(SUGGESTIONS)
    renderPlanner({ withSuggestions: false })

    await user.click(await screen.findByRole('button', { name: /^Add dinner for / }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load suggestions.")

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('button', { name: 'Choose Porridge' })).toBeInTheDocument()
  })

  it('has no accessibility problems found by axe when suggestions failed', async () => {
    const user = userEvent.setup()
    vi.mocked(apiFetch).mockRejectedValue(new Error('Network error'))
    const { baseElement } = renderPlanner({ withSuggestions: false })

    await user.click(await screen.findByRole('button', { name: /^Add dinner for / }))
    await screen.findByRole('alert')
    await expectNoAxeViolations(baseElement)
  })
})
