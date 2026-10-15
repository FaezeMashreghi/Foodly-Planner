import { useState } from 'react'
import type { Meal } from '@shared/meal/meal'
import { Dialog } from '@/components/ui/dialog/dialog'
import { PillButton } from '@/components/ui/pill-button/pill-button'
import { MealDetails } from '@/components/weekly-plan/meal-details/meal-details'

export function MealDetailsButton({ meal }: { meal: Meal }) {
  const [open, setOpen] = useState(false)

  function openDetails() {
    setOpen(true)
  }

  function closeDetails() {
    setOpen(false)
  }

  return (
    <>
      <PillButton icon="📖" hiddenText={`for ${meal.name}`} onClick={openDetails}>
        Recipe
      </PillButton>
      <Dialog open={open} onClose={closeDetails} title={meal.name}>
        {open && <MealDetails meal={meal} />}
      </Dialog>
    </>
  )
}
