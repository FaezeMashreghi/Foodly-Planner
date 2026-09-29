import { formatLongDate } from '@/lib/format-date'

export function describeStartDay(isoDate: string, index: number): string {
  const date = formatLongDate(isoDate)
  if (index === 0) return `Today, ${date}`
  if (index === 1) return `Tomorrow, ${date}`
  return date
}
