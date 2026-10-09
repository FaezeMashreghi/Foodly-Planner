import '@/api/monitoring/instrument'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import '@fontsource-variable/nunito'
import './index.css'
import { getAccessToken, getUser, subscribe } from '@/api/auth/session'
import {
  reactErrorHandlers,
  reportToMonitoring,
  setMonitoringUser,
  traceRouter,
} from '@/api/monitoring/monitoring'
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

traceRouter(router)

// When the user signs in or out (or the session expires): drop the previous user's data,
// re-run the route guards and loaders, and update the user on error reports.
subscribe(() => {
  queryClient.clear()
  void router.invalidate()
  setMonitoringUser(getUser())
})

setMonitoringUser(getUser())

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!, reactErrorHandlers).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
