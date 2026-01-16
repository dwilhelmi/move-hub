"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { MobileHeader } from "@/components/mobile-header"

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

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
