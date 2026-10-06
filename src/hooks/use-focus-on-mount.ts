import { useEffect, useRef } from 'react'

/** Focuses the element when the screen appears, so a screen reader reads where the user is. */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return ref
}
