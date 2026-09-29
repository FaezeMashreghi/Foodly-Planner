/** The ids a field links together, and its `aria-describedby` (hint, error, plus any extra ids). */
export function fieldIds(
  id: string,
  { hint, error, describedBy }: { hint?: string; error?: string; describedBy?: string },
) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return {
    hintId,
    errorId,
    describedBy:
      [describedBy, hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined,
  }
}
