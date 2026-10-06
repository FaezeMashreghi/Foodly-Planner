type StepProgressProps = {
  id?: string
  current: number
  total: number
  label: string
}

export function StepProgress({ id, current, total, label }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p id={id} className="text-sm font-semibold text-ink-muted">
        {label} {current} of {total}
      </p>
      <ol aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <li
            key={index}
            className={`size-2.5 rounded-full ${index < current ? 'bg-brand' : 'bg-line'}`}
          />
        ))}
      </ol>
    </div>
  )
}
