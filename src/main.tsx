import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import '@fontsource-variable/nunito'
import './index.css'
import { getAccessToken, getUser, subscribe } from '@/api/auth/session'
import { PageError } from '@/components/layout/page-error/page-error'
import { PagePending } from '@/components/layout/page-pending/page-pending'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: { auth: { getUser, getAccessToken }, queryClient },
  defaultErrorComponent: PageError,
  defaultPendingComponent: PagePending,
})

// When the user signs in or out (or the session expires): drop the previous user's data,
// then re-run the route guards and loaders.
subscribe(() => {
  queryClient.clear()
  void router.invalidate()
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
