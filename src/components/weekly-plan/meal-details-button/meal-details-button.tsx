import { useState } from 'react'
import type { Meal } from '@shared/meal/meal'
import { Dialog } from '@/components/ui/dialog/dialog'
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
      {/* The clickable area stays 44px high; the visible pill inside is smaller. */}
      <button type="button" className="group flex min-h-11 items-center px-1" onClick={openDetails}>
        <span className="flex items-center gap-1 rounded-control border border-line-strong bg-surface px-2 py-1 text-sm font-semibold text-brand group-hover:bg-brand-soft">
          <span aria-hidden="true">📖</span>
          Recipe
        </span>{' '}
        <span className="sr-only">for {meal.name}</span>
      </button>
      <Dialog open={open} onClose={closeDetails} title={meal.name}>
        {open && <MealDetails meal={meal} />}
      </Dialog>
    </>
  )
}
