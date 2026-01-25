"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { GuestSavePrompt } from "@/components/guest-save-prompt"
import { useAuth } from "@/components/providers/auth-provider"
import { useDataProvider } from "@/lib/data/hooks"
import { migrateGuestDataToDatabase } from "@/lib/data/migration"

const publicRoutes = ["/login", "/signup", "/auth/callback"]

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user, isLoading, isGuest, guestId } = useAuth()
  const pathname = usePathname()
  const provider = useDataProvider()

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Check for pending guest data migration after email confirmation
  useEffect(() => {
    const checkPendingMigration = async () => {
      // Only check if user is authenticated and not a guest
      if (!user || isGuest || isLoading) return

      // Check for pending migration flag
      const pendingUserId = localStorage.getItem("move-hub-pending-migration-user-id")
      if (!pendingUserId || pendingUserId !== user.id) return

      // Check if there's actually guest data to migrate
      const guestIdFromStorage = localStorage.getItem("move-hub-guest-id")
      if (!guestIdFromStorage) {
        // No guest data, just clear the pending flag
        localStorage.removeItem("move-hub-pending-migration-user-id")
        return
      }

      // Perform migration
      console.log("Performing delayed guest data migration after email confirmation")
      const result = await migrateGuestDataToDatabase(
        guestIdFromStorage,
        user.id,
        provider
      )

      if (result.success) {
        console.log("Migration successful:", result.newHubId)
        // Clear pending migration flag
        localStorage.removeItem("move-hub-pending-migration-user-id")
        // Force a page refresh to load the new hub
        window.location.reload()
      } else {
        console.error("Migration failed:", result.error)
        // Keep the pending flag so we can retry
      }
    }

    checkPendingMigration()
  }, [user, isGuest, isLoading, provider])

  // For public routes (login, signup), render without sidebar
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Guest mode is allowed - render layout for both authenticated users and guests
  // (No longer block rendering when !user since guests are supported)

  return (
    <div className="flex h-screen overflow-hidden">
      <GuestSavePrompt />
      <Sidebar />
      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 w-0 min-w-0">
        <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">{children}</main>
      </div>
    </div>
  )
}
