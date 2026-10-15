import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Meal } from '@shared/meal/meal'
import type { SuggestionsState } from '@/components/weekly-plan/week-planner/week-view'
import { expectNoAxeViolations } from '@/test/axe'
import { MealSlot, type MealSlotProps } from './meal-slot'

// The cards have Recipe buttons; the mock keeps Cognito and the backend out of the test.
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

const suggestions: SuggestionsState = {
  status: 'success',
  choices: { Breakfast: [porridge, omelette], Lunch: [], Dinner: [] },
}

describe('MealSlot', () => {
  it('places a meal without dragging, then keeps focus on the slot', async () => {
    const user = userEvent.setup()
    const onPlace = vi.fn()
    const props: MealSlotProps = {
      day: 'Monday',
      mealType: 'Breakfast',
      suggestions,
      onPlace,
    }
    const { rerender } = render(<MealSlot {...props} />)

    await user.click(screen.getByRole('button', { name: 'Add breakfast for Monday' }))
    expect(screen.getByRole('dialog', { name: 'Choose breakfast for Monday' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Choose Omelette' }))
    expect(onPlace).toHaveBeenCalledWith('Monday Breakfast', omelette)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // The plan updates: the meal card replaces the Add button, which had focus.
    rerender(<MealSlot {...props} meal={omelette} />)
    expect(screen.getByRole('button', { name: 'Change breakfast for Monday' })).toHaveFocus()
  })

  it('has no accessibility problems found by axe with the picker open', async () => {
    const user = userEvent.setup()
    const { baseElement } = render(
      <MealSlot
        day="Monday"
        mealType="Breakfast"
        meal={porridge}
        suggestions={suggestions}
        onPlace={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Change breakfast for Monday' }))
    // The dialog is portaled to <body>, outside the render container.
    await expectNoAxeViolations(baseElement)
  })
})
