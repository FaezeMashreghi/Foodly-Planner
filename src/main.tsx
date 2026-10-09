import './instrument'
import { StrictMode, type ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import * as Sentry from '@sentry/react'
import '@fontsource-variable/nunito'
import './index.css'
import { getAccessToken, getUser, subscribe } from '@/api/auth/session'
import { reportToMonitoring } from '@/api/monitoring/monitoring'
import { PageError } from '@/components/layout/page-error/page-error'
import { PagePending } from '@/components/layout/page-pending/page-pending'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportToMonitoring }),
  mutationCache: new MutationCache({ onError: reportToMonitoring }),
})

const router = createRouter({
  routeTree,
  context: { auth: { getUser, getAccessToken }, queryClient },
  defaultErrorComponent: PageError,
  defaultPendingComponent: PagePending,
})

// When the user signs in or out (or the session expires): drop the previous user's data,
// re-run the route guards and loaders, and update the user on Sentry errors.
subscribe(() => {
  queryClient.clear()
  void router.invalidate()
  setSentryUser()
})
setSentryUser()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function setSentryUser() {
  const user = getUser()
  Sentry.setUser(user ? { id: user.id } : null)
}

function logError(error: unknown) {
  console.error(error)
}

function handleUncaughtError(error: unknown, errorInfo: ErrorInfo) {
  Sentry.captureReactException(error, errorInfo, {
    mechanism: { handled: false, type: 'react.uncaught' },
  })
  logError(error)
}

createRoot(document.getElementById('root')!, {
  onCaughtError: Sentry.reactErrorHandler(logError),
  onUncaughtError: handleUncaughtError,
}).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
