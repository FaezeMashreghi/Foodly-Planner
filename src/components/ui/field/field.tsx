import type { ReactNode } from 'react'
import { labelSizes, type LabelSize } from './label-sizes'

type FieldProps = {
  id: string
  label: string
  labelSize?: LabelSize
  hint?: string
  hintId: string
  error?: string
  errorId: string
  className?: string
  /** The control itself (an <input>, a <textarea>…), with `id={id}`. */
  children: ReactNode
}

/** The label, hint and error around a form control; shared by TextField and TextArea. */
export function Field({
  id,
  label,
  labelSize = 'default',
  hint,
  hintId,
  error,
  errorId,
  className,
  children,
}: FieldProps) {
  return (
    <div className={className ? `space-y-1 ${className}` : 'space-y-1'}>
      <label htmlFor={id} className={`block text-ink ${labelSizes[labelSize]}`}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          <span className="sr-only">Error:</span> {error}
        </p>
      )}
    </div>
  )
}
