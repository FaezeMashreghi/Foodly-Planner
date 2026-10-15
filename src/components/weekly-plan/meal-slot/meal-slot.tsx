import { useEffect, useRef, useState, type Ref } from 'react'
import type { Meal, MealType } from '@shared/meal/meal'
import { toSlotId, type Day } from '@shared/week-plan/week-plan'
import { Dialog } from '@/components/ui/dialog/dialog'
import { PillButton } from '@/components/ui/pill-button/pill-button'
import { MealCard } from '@/components/weekly-plan/meal-card/meal-card'
import { MealDetailsButton } from '@/components/weekly-plan/meal-details-button/meal-details-button'
import { MealPicker } from '@/components/weekly-plan/meal-picker/meal-picker'
import { UnavailableSuggestions } from '@/components/weekly-plan/unavailable-suggestions/unavailable-suggestions'
import type { PlaceMealInSlot, SuggestionsState } from '@/components/weekly-plan/week-view'

export type MealSlotProps = {
  day: Day
  mealType: MealType
  meal?: Meal
  suggestions: SuggestionsState
  onPlace: PlaceMealInSlot
  dropRef?: Ref<HTMLDivElement>
  isDropTarget?: boolean
}

export function MealSlot({
  day,
  mealType,
  meal,
  suggestions,
  onPlace,
  dropRef,
  isDropTarget = false,
}: MealSlotProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const changeButtonRef = useRef<HTMLButtonElement>(null)
  const pickedMealId = useRef<string | undefined>(undefined)
  const mealName = mealType.toLowerCase()

  // The Add button had focus, and the meal card replaces it: move focus to its Change button.
  useEffect(() => {
    if (meal && meal.id === pickedMealId.current) changeButtonRef.current?.focus()
    pickedMealId.current = undefined
  }, [meal])

  function openPicker() {
    setPickerOpen(true)
  }

  function closePicker() {
    setPickerOpen(false)
  }

  function pick(chosen: Meal) {
    setPickerOpen(false)
    pickedMealId.current = meal ? undefined : chosen.id
    onPlace(toSlotId(day, mealType), chosen)
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-ink-muted">{mealType}</h3>
      <div
        ref={dropRef}
        className={`min-h-20 rounded-control border border-dashed p-2 ${
          isDropTarget ? 'border-brand bg-brand-soft' : 'border-line-strong'
        }`}
      >
        {meal ? (
          <MealCard
            meal={meal}
            action={
              <>
                <MealDetailsButton meal={meal} />
                <PillButton
                  ref={changeButtonRef}
                  hiddenText={`${mealName} for ${day}`}
                  onClick={openPicker}
                >
                  Change
                </PillButton>
              </>
            }
          />
        ) : (
          <button
            type="button"
            className="flex min-h-16 w-full items-center justify-center gap-2 rounded-control font-semibold text-brand hover:bg-brand-soft"
            onClick={openPicker}
          >
            <span aria-hidden="true">+</span>
            Add {mealName} <span className="sr-only">for {day}</span>
          </button>
        )}
      </div>

      <Dialog open={pickerOpen} onClose={closePicker} title={`Choose ${mealName} for ${day}`}>
        {pickerOpen &&
          (suggestions.status === 'success' ? (
            <MealPicker meals={suggestions.choices[mealType]} onPick={pick} />
          ) : (
            <UnavailableSuggestions suggestions={suggestions} />
          ))}
      </Dialog>
    </div>
  )
}
