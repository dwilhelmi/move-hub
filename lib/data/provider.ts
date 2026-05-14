/**
 * Data Provider Factory
 *
 * Creates the appropriate data provider based on storage mode.
 * This is the single point where we choose between Supabase and localStorage.
 */

"use client"

import type { DataProvider, StorageMode } from "./types"
import { SupabaseDataProvider } from "./supabase-provider"
import { LocalStorageDataProvider } from "./local-provider"

/**
 * Factory function to create the appropriate data provider
 *
 * @param mode - 'database' for authenticated users, 'local' for guests
 * @returns DataProvider implementation
 */
export function createDataProvider(mode: StorageMode): DataProvider {
  if (mode === "database") {
    return new SupabaseDataProvider()
  } else {
    return new LocalStorageDataProvider()
  }
}
