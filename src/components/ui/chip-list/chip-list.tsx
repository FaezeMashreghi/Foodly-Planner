export type Chip = {
  id: string
  label: string
  emoji?: string
}

const sizes = {
  small: 'gap-1 px-2 text-xs',
  medium: 'gap-1 px-3 py-1 text-sm',
}

type ChipListProps = {
  chips: readonly Chip[]
  size?: keyof typeof sizes
  label?: string
}

export function ChipList({ chips, size = 'medium', label }: ChipListProps) {
  return (
    <ul role="list" aria-label={label} className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li
          key={chip.id}
          className={`flex items-center rounded-control bg-brand-soft font-semibold text-brand ${sizes[size]}`}
        >
          {chip.emoji && <span aria-hidden="true">{chip.emoji}</span>}
          {chip.label}
        </li>
      ))}
    </ul>
  )
}
