import type { ErrorInfo } from 'react'
import type { RootOptions } from 'react-dom/client'
import type { AnyRouter } from '@tanstack/react-router'
import * as Sentry from '@sentry/react'
import type { AuthUser } from '@/api/auth/session'
import { ApiError } from '@/api/foodly/api-error'

export function shouldReportError(error: unknown): boolean {
  if (error instanceof ApiError) return error.status >= 500
  return navigator.onLine
}

export function reportToMonitoring(error: unknown) {
  if (shouldReportError(error)) Sentry.captureException(error)
}

export function setMonitoringUser(user: AuthUser | null) {
  Sentry.setUser(user ? { id: user.id } : null)
}

// Names traces after the route (/_authenticated/weekly-plan), not each URL.
export function traceRouter(router: AnyRouter) {
  Sentry.addIntegration(Sentry.tanstackRouterBrowserTracingIntegration(router))
}

export const reactErrorHandlers: RootOptions = {
  onCaughtError: Sentry.reactErrorHandler(logError),
  onUncaughtError: handleUncaughtError,
}

function handleUncaughtError(error: unknown, errorInfo: ErrorInfo) {
  Sentry.captureReactException(error, errorInfo, {
    mechanism: { handled: false, type: 'react.uncaught' },
  })
  logError(error)
}

function logError(error: unknown) {
  console.error(error)
}
