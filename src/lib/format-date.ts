/** "2026-09-29" → "Tuesday 29 September", in local time. */
export function formatLongDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
