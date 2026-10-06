import { useSyncExternalStore } from 'react'
import { getUser, subscribe } from '@/api/auth/session'

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getUser)
  return { user, isSignedIn: user !== null }
}
