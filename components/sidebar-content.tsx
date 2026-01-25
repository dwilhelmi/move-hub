"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import {
  Home,
  Hammer,
  Calendar,
  Package,
  DollarSign,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Move Prep", href: "/move-prep", icon: Hammer },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Budget", href: "/budget", icon: DollarSign },
]

interface SidebarContentProps {
  onLinkClick?: () => void
}

export function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, isGuest } = useAuth()

  const handleLogout = async () => {
    onLinkClick?.()
    await signOut()
    router.push("/login")
  }

  const handleLogin = () => {
    onLinkClick?.()
    router.push("/login")
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
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-3 py-4 space-y-1">
        {isGuest && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
              Guest Mode
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
              Data stored locally only
            </p>
            <Link
              href="/signup"
              onClick={onLinkClick}
              className="block text-center text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded transition-colors"
            >
              Sign Up to Save
            </Link>
          </div>
        )}
        <Link
          href="/settings"
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        {isGuest ? (
          <button
            onClick={handleLogin}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogIn className="h-5 w-5" />
            Log In
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        )}
      </div>
    </div>
  )
}
