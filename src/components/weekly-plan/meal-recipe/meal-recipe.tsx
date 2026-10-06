import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { recipeQueryOptions } from '@/api/foodly/recipe'
import { ChipList } from '@/components/ui/chip-list/chip-list'
import { FormError } from '@/components/ui/form-error/form-error'
import { useFocusOnChange } from '@/hooks/use-focus-on-change'

export function MealRecipe({ mealId }: { mealId: string }) {
  const [requested, setRequested] = useState(false)
  const {
    data: recipe,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    ...recipeQueryOptions(mealId),
    enabled: requested,
  })
  const headingId = useId()
  const headingRef = useFocusOnChange<HTMLHeadingElement>(recipe)

  function handleGetRecipe() {
    if (requested) {
      void refetch()
    } else {
      setRequested(true)
    }
  }

  const status = isFetching ? 'Writing the recipe… this can take a few seconds.' : ''

  return (
    <section aria-labelledby={recipe ? headingId : undefined} className="space-y-3">
      <p role="status" className="text-sm text-ink-muted">
        {status}
      </p>

      {isError && !isFetching && (
        <FormError message="Couldn't load the recipe. Please try again." />
      )}

      {!recipe && (
        <button
          type="button"
          className="btn-primary"
          disabled={isFetching}
          onClick={handleGetRecipe}
        >
          Get recipe
        </button>
      )}

      {recipe && (
        <div className="space-y-5 rounded-card bg-canvas p-4">
          <h3 id={headingId} ref={headingRef} tabIndex={-1} className="text-heading">
            Recipe
          </h3>

          {recipe.extras.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">
                <span aria-hidden="true">🧂 </span>You'll also need
              </h4>
              <ChipList chips={recipe.extras.map((extra) => ({ id: extra, label: extra }))} />
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold">
              <span aria-hidden="true">👩‍🍳 </span>Steps
            </h4>
            <ol role="list" className="space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-on-brand"
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tips.length > 0 && (
            <div className="space-y-1 rounded-control border-l-4 border-brand bg-brand-soft p-3">
              <h4 className="font-semibold">
                <span aria-hidden="true">💡 </span>Tips
              </h4>
              <ul className="list-disc space-y-1 pl-5">
                {recipe.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-ink-muted">
            Written by AI. Check allergens and cooking times before you cook.
          </p>
        </div>
      )}
    </section>
  )
}
