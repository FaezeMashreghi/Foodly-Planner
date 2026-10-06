import { useId, type ComponentProps } from 'react'
import { Field } from '@/components/ui/field/field'
import { fieldIds } from '@/components/ui/field/field-ids'
import type { LabelSize } from '@/components/ui/field/label-sizes'

export type TextAreaProps = Omit<ComponentProps<'textarea'>, 'id'> & {
  /** Visible label. Required: every input needs one. */
  label: string
  /** Helper text shown between the label and the box. */
  hint?: string
  /** Error message. When set, the box is marked invalid. */
  error?: string
  /** `large` when the label is the question of the page, e.g. one question per step. */
  labelSize?: LabelSize
}

/**
 * A labelled multi-line text box, for answers longer than one line (Enter makes a new line).
 * Same props as TextField; other props (rows, maxLength, onKeyDown, ref…) go to the <textarea>.
 */
export function TextArea({
  label,
  hint,
  error,
  labelSize,
  className,
  rows = 3,
  value,
  maxLength,
  'aria-describedby': describedByProp,
  ...textareaProps
}: TextAreaProps) {
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
        <textarea
          {...textareaProps}
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="block field-sizing-content max-h-72 min-h-28 w-full resize-none rounded-card border border-line-strong bg-canvas px-4 pt-3 pb-8 text-base text-ink transition-colors placeholder:text-ink-muted focus:bg-surface focus-visible:-outline-offset-1 aria-invalid:border-danger"
        />
        {maxLength !== undefined && typeof value === 'string' && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 bottom-2 text-xs text-ink-muted"
          >
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </Field>
  )
}
