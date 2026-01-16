"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SidebarContent } from "./sidebar-content"

export function Sidebar() {
  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r bg-card shrink-0">
      <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
        <h1 className="text-lg lg:text-xl font-bold">Move Hub</h1>
        <ThemeToggle />
      </div>
      <SidebarContent />
    </div>
  )
}
