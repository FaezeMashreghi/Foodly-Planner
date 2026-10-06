import { useId, type ReactNode } from 'react'

export type RadioOption<T extends string> = {
  value: T
  label: string
}

type RadioGroupProps<T extends string> = {
  legend: ReactNode
  hint?: string
  options: readonly RadioOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function RadioGroup<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  className = '',
}: RadioGroupProps<T>) {
  const name = useId()
  const hintId = `${name}-hint`

  return (
    <fieldset aria-describedby={hint ? hintId : undefined} className={`space-y-3 ${className}`}>
      <legend className="mb-3">{legend}</legend>

      {hint && (
        <p id={hintId} className="text-ink-muted">
          {hint}
        </p>
      )}

      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control border border-line-strong px-3 has-checked:border-brand has-checked:bg-brand-soft"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="size-5 accent-brand"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
