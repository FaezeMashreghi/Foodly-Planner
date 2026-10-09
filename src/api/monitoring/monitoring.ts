import * as Sentry from '@sentry/react'
import { ApiError } from '@/api/foodly/client'

/** Only unexpected errors: a server failure (5xx) or a bug. Not 4xx answers or the user being offline. */
export function shouldReportError(error: unknown): boolean {
  if (error instanceof ApiError) return error.status >= 500
  return navigator.onLine
}

export function reportToMonitoring(error: unknown) {
  if (shouldReportError(error)) Sentry.captureException(error)
}
