"use client"

import { MobileMenuButton } from "./mobile-menu-button"
import { ThemeToggle } from "./ui/theme-toggle"

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-16 border-b bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <MobileMenuButton onClick={onMenuClick} />
        <h1 className="text-lg font-bold">Move Hub</h1>
      </div>
      <ThemeToggle />
    </div>
  )
}
