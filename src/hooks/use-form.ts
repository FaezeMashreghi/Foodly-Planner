import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'

/** A rule per field: returns an error message, or `undefined` if the value is valid. */
export type Validate<Values> = {
  [Field in keyof Values]?: (value: Values[Field]) => string | undefined
}

export type FormErrors<Values> = Partial<Record<keyof Values, string>>

type UseFormOptions<Values> = {
  initialValues: Values
  validate: Validate<Values>
  /** Called only when every field is valid. */
  onSubmit: (values: Values) => Promise<void> | void
}

/**
 * Form state and validation, "reward early, punish late":
 * - no errors while the user first fills in the form;
 * - on submit, show every error and focus the first invalid field;
 * - after that, errors update as the user types, so a fixed field clears at once.
 */
export function useForm<Values extends Record<string, string>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<Values>) {
  const [values, setValues] = useState(initialValues)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // State only updates on the next render, so two fast clicks could both see
  // `submitting === false`. A ref updates at once and blocks the second submit.
  const inFlight = useRef(false)
  const inputs = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({})

  const errors = validateAll(values, validate)
  const visibleErrors: FormErrors<Values> = submitted ? errors : {}

  function field(name: keyof Values) {
    return {
      name: String(name),
      value: values[name],
      onChange: (event: ChangeEvent<HTMLInputElement>) =>
        setValues((current) => ({ ...current, [name]: event.target.value })),
      error: visibleErrors[name],
      ref: (input: HTMLInputElement | null) => {
        inputs.current[name] = input
      },
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    setSubmitted(true)

    // Fields are checked in the order of initialValues, which is the form's order.
    const firstInvalid = (Object.keys(values) as (keyof Values)[]).find((name) => errors[name])
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus()
      return
    }

    inFlight.current = true
    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return { values, errors: visibleErrors, submitting, field, handleSubmit }
}

function validateAll<Values>(values: Values, validate: Validate<Values>): FormErrors<Values> {
  const errors: FormErrors<Values> = {}
  for (const name in validate) {
    const error = validate[name]?.(values[name])
    if (error) errors[name] = error
  }
  return errors
}
