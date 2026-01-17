"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/app/lib/storage"
import {
  Home,
  Hammer,
  Calendar,
  Package,
  DollarSign,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, active: true },
  { name: "House Prep", href: "/house-prep", icon: Hammer, active: true },
  { name: "Timeline", href: "/timeline", icon: Calendar, active: true },
  { name: "Inventory", href: "/inventory", icon: Package, active: true },
  { name: "Budget", href: "/budget", icon: DollarSign, active: true },
]

interface SidebarContentProps {
  onLinkClick?: () => void
}

export function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    // Close mobile sidebar if open
    onLinkClick?.()
    // Refresh the page to show empty state
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive && item.active
                  ? "bg-primary text-primary-foreground"
                  : item.active
                  ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                  : "cursor-not-allowed text-muted-foreground opacity-50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  )
}
