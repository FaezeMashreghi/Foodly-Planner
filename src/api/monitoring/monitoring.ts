import * as Sentry from '@sentry/react'
import { ApiError } from '@/api/foodly/api-error'

export function shouldReportError(error: unknown): boolean {
  if (error instanceof ApiError) return error.status >= 500
  return navigator.onLine
}

export function reportToMonitoring(error: unknown) {
  if (shouldReportError(error)) Sentry.captureException(error)
}
