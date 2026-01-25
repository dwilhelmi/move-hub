"use client"

import { type ReactNode } from "react"
import { useAuth } from "./auth-provider"
import { DataProviderProvider } from "@/lib/data/hooks"

/**
 * Wrapper component that determines storage mode based on auth state
 * and provides the appropriate DataProvider to children.
 *
 * This must be nested inside AuthProvider so it can access auth context.
 */
export function DataProviderWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // Determine storage mode based on authentication state
  // Authenticated users use database, unauthenticated users use local storage
  const mode = user ? "database" : "local"

  return <DataProviderProvider mode={mode}>{children}</DataProviderProvider>
}
