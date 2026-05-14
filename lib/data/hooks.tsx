/**
 * React Hooks for Data Provider
 *
 * Provides React context and hooks to access the data provider throughout the app.
 */

"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { DataProvider, StorageMode } from "./types"
import { createDataProvider } from "./provider"

/**
 * Context to hold the current data provider instance
 */
const DataProviderContext = createContext<DataProvider | null>(null)

/**
 * Props for DataProviderProvider component
 */
interface DataProviderProviderProps {
  children: ReactNode
  mode: StorageMode
}

/**
 * Provider component that wraps the app and provides data access
 *
 * Usage:
 * ```tsx
 * <DataProviderProvider mode={user ? 'database' : 'local'}>
 *   <App />
 * </DataProviderProvider>
 * ```
 */
export function DataProviderProvider({ children, mode }: DataProviderProviderProps) {
  // Create provider instance, memoized based on mode
  const provider = useMemo(() => createDataProvider(mode), [mode])

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  )
}

/**
 * Hook to access the data provider
 *
 * Must be used within a DataProviderProvider.
 *
 * Usage:
 * ```tsx
 * const provider = useDataProvider()
 * const tasks = await provider.getTasks(hubId)
 * ```
 *
 * @throws Error if used outside of DataProviderProvider
 */
export function useDataProvider(): DataProvider {
  const provider = useContext(DataProviderContext)

  if (!provider) {
    throw new Error("useDataProvider must be used within DataProviderProvider")
  }

  return provider
}
