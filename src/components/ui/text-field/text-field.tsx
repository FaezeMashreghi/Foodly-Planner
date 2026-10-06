import { useId, type ComponentProps, type ReactNode } from 'react'
import { Field } from '@/components/ui/field/field'
import { fieldIds } from '@/components/ui/field/field-ids'
import type { LabelSize } from '@/components/ui/field/label-sizes'

export type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  /** Visible label. Required: every input needs one. */
  label: string
  /** Helper text shown between the label and the input. */
  hint?: string
  /** Error message. When set, the input is marked invalid. */
  error?: string
  /** A control shown inside the input on the right, e.g. a "Show" button. */
  action?: ReactNode
  /** `large` when the label is the question of the page, e.g. one question per step. */
  labelSize?: LabelSize
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
  labelSize,
  className,
  'aria-describedby': describedByProp,
  ...inputProps
}: TextFieldProps) {
  const id = useId()
  const { hintId, errorId, describedBy } = fieldIds(id, {
    hint,
    error,
    describedBy: describedByProp,
  })

  return (
    <Field
      id={id}
      label={label}
      labelSize={labelSize}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      className={className}
    >
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`block min-h-11 w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus-visible:-outline-offset-1 aria-invalid:border-danger ${action ? 'pr-20' : ''}`}
        />
        {action && <div className="absolute inset-y-0 right-0 flex items-center">{action}</div>}
      </div>
    </Field>
  )
}
