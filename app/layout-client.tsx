"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { useAuth } from "@/components/providers/auth-provider"

const publicRoutes = ["/login", "/signup", "/auth/callback"]

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

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

  // If not logged in and not on public route, middleware will redirect
  // But render nothing here as a fallback
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
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
