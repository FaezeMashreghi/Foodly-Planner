import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { describe, it, vi } from 'vitest'
import type { Meal } from '@shared/meal/meal'
import type { Plan } from '@shared/week-plan/week-plan'
import { expectNoAxeViolations } from '@/test/axe'
import { PlanHistory } from './plan-history'

const client = vi.hoisted(() => ({ apiFetch: vi.fn() }))
vi.mock('@/api/foodly/client', () => client)

const meals = [{ id: 'menemen', name: 'Menemen', emoji: '🍳' }] as Meal[]

const plans: Plan[] = [
  { weekStart: '2026-10-05', slots: { 'Monday Breakfast': 'menemen', 'Monday Dinner': 'removed' } },
  { weekStart: '2026-09-28', slots: { 'Friday Lunch': 'menemen' } },
]

function fakeApi(path: string) {
  return Promise.resolve(path === '/meals' ? meals : { plans })
}

function renderHistory() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <PlanHistory />
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('PlanHistory', () => {
  it('has no axe violations with weeks listed and the newest open', async () => {
    client.apiFetch.mockImplementation(fakeApi)
    const { container } = renderHistory()

    await screen.findByText('Meal no longer available')

    await expectNoAxeViolations(container)
  })
})
