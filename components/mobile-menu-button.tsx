"use client"

import { Button } from "./ui/button"
import { Menu } from "lucide-react"

interface MobileMenuButtonProps {
  onClick: () => void
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="md:hidden h-10 w-10"
      aria-label="Open menu"
    >
      <Menu className="h-6 w-6" />
    </Button>
  )
}
