import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Plan } from '@shared/week-plan/week-plan'
import { planQueryOptions, savePlanSlots } from '@/api/foodly/plan'

export function useSavePlanSlots(weekStart: string, onError: () => void) {
  const queryClient = useQueryClient()
  const planKey = planQueryOptions(weekStart).queryKey
  const mutationKey = ['save-plan-slots', weekStart]

  async function showNewSlots(nextPlan: Plan) {
    await queryClient.cancelQueries({ queryKey: planKey })
    const current = queryClient.getQueryData(planKey)
    if (current) {
      queryClient.setQueryData(planKey, { ...current, slots: nextPlan.slots })
    }
  }

  function reloadAfterLastSave() {
    if (queryClient.isMutating({ mutationKey }) === 1) {
      return queryClient.invalidateQueries({ queryKey: planKey })
    }
  }

  return useMutation({
    mutationKey,
    mutationFn: savePlanSlots,
    scope: { id: `save-plan-slots-${weekStart}` },
    onMutate: showNewSlots,
    onError,
    onSettled: reloadAfterLastSave,
  })
}
