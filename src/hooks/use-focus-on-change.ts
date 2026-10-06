import { useEffect, useRef } from 'react'

/**
 * Focuses the element when `value` changes, e.g. the new question after Next, so a screen reader
 * reads it. Not on the first render: arriving on a page should start at its title.
 */
export function useFocusOnChange<T extends HTMLElement>(value: unknown) {
  const ref = useRef<T>(null)
  const focusedValue = useRef(value)

  useEffect(() => {
    if (focusedValue.current === value) return
    focusedValue.current = value
    ref.current?.focus()
  }, [value])

  return ref
}
