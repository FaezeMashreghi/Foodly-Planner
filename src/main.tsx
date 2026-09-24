import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import '@fontsource-variable/nunito'
import './index.css'
import { getUser, subscribe } from '@/api/auth/session'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree, context: { auth: { getUser } } })

// Re-run the route guards when the user signs in or out (e.g. the session expires).
subscribe(() => router.invalidate())

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
