import { useId, type ComponentProps, type ReactNode } from 'react'

export type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  /** Visible label. Required: every input needs one. */
  label: string
  /** Helper text shown between the label and the input. */
  hint?: string
  /** Error message. When set, the input is marked invalid. */
  error?: string
  /** A control shown inside the input on the right, e.g. a "Show" button. */
  action?: ReactNode
}

/**
 * A labelled text input. Links the label, hint and error to the input for
 * screen readers. All other props (type, name, autoComplete, required, ref…)
 * go to the <input>; `className` goes to the wrapper, for layout.
 */
export function TextField({
  label,
  hint,
  error,
  action,
  className,
  'aria-describedby': describedByProp,
  ...inputProps
}: TextFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [describedByProp, hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className ? `space-y-1 ${className}` : 'space-y-1'}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`block min-h-11 w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-ink placeholder:text-ink-muted aria-invalid:border-danger ${action ? 'pr-20' : ''}`}
        />
        {action && <div className="absolute inset-y-0 right-0 flex items-center">{action}</div>}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          <span className="sr-only">Error:</span> {error}
        </p>
      )}
    </div>
  )
}
