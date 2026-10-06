import type { Food } from '@shared/food/food'
import { DraggableFood } from '@/components/weekly-plan/draggable-food/draggable-food'

type SuggestionListProps = {
  foods: Food[]
  className?: string
}

export function SuggestionList({ foods, className = '' }: SuggestionListProps) {
  return (
    <aside
      aria-labelledby="suggestion-list-heading"
      className={`flex flex-col gap-3 card ${className}`}
    >
      <h2 id="suggestion-list-heading" className="text-heading">
        Suggestions
      </h2>
      <p className="text-sm text-ink-muted">Drag a food onto a meal.</p>
      <ul className="-mx-1 min-h-0 flex-1 space-y-2 overflow-y-auto px-1 py-1">
        {foods.map((food) => (
          <li key={food.id}>
            <DraggableFood food={food} />
          </li>
        ))}
      </ul>
    </aside>
  )
}
