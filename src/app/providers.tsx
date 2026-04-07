import { type ReactNode } from 'react'

type AppProvidersProps = {
  children: ReactNode
}

/** Root providers; extend with data routers, motion prefs, etc. */
export function AppProviders({ children }: AppProvidersProps) {
  return children
}
