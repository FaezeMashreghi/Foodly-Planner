import { getIngredient } from '@shared/meal/ingredients'
import type { PlanAnswers } from '@shared/week-plan/week-plan'
import type { Chip } from '@/components/ui/chip-list/chip-list'

/** One chip per ingredient id, with its name and emoji; an unknown id is shown as it is. */
export function toIngredientChips(ids: readonly string[]): Chip[] {
  return ids.map((id) => {
    const ingredient = getIngredient(id)
    return { id, label: ingredient?.name ?? id, emoji: ingredient?.emoji }
  })
}

/** The cooking time in words, e.g. "Quick and easy, up to 30 minutes"; null if not mentioned. */
export function describeCookingTime({
  easyOnly,
  maxPrepMinutes,
}: Pick<PlanAnswers, 'easyOnly' | 'maxPrepMinutes'>): string | null {
  if (maxPrepMinutes !== null) {
    return `${easyOnly ? 'Quick and easy, up' : 'Up'} to ${maxPrepMinutes} minutes`
  }
  return easyOnly ? 'Quick and easy meals' : null
}
