"use client"

import { createContext, useContext, useEffect, useState, useRef, useMemo } from "react"
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isGuest: boolean
  guestId: string | null
  signOut: () => Promise<void>
  startGuestSession: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isGuest: false,
  guestId: null,
  signOut: async () => {},
  startGuestSession: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [guestId, setGuestId] = useState<string | null>(null)
  const hasExplicitlySignedOut = useRef(false)
  // Create client only once - re-creating on every render causes issues
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log("[AuthProvider] Getting initial session")
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log("[AuthProvider] Session:", session?.user?.email || "no user")
      setSession(session)
      setUser(session?.user ?? null)

      // If no user session, check for guest ID in localStorage
      // Don't auto-create if user has explicitly signed out
      if (!session?.user && !hasExplicitlySignedOut.current) {
        const storedGuestId = typeof window !== "undefined"
          ? localStorage.getItem("move-hub-guest-id")
          : null

        console.log("[AuthProvider] No user, hasExplicitlySignedOut:", hasExplicitlySignedOut.current, "storedGuestId:", storedGuestId)

        if (storedGuestId) {
          setGuestId(storedGuestId)
          console.log("[AuthProvider] Loaded guest ID:", storedGuestId)
        } else {
          // Auto-start guest session for new users
          const newGuestId = crypto.randomUUID()
          if (typeof window !== "undefined") {
            localStorage.setItem("move-hub-guest-id", newGuestId)
          }
          setGuestId(newGuestId)
          console.log("[AuthProvider] Created new guest ID:", newGuestId)
        }
      } else {
        console.log("[AuthProvider] Not creating guest session - user:", !!session?.user, "hasExplicitlySignedOut:", hasExplicitlySignedOut.current)
      }

      console.log("[AuthProvider] Setting isLoading to false")
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      console.log("[AuthProvider] Auth state change:", _event, "session:", session?.user?.email || "no user")
      setSession(session)
      setUser(session?.user ?? null)

      // Clear guest ID when user signs in
      if (session?.user) {
        hasExplicitlySignedOut.current = false // Reset flag when user signs in
        setGuestId((prevGuestId) => {
          if (prevGuestId) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("move-hub-guest-id")
            }
            return null
          }
          return prevGuestId
        })
      }

      // When user signs out, respect the hasExplicitlySignedOut flag
      // The signOut() function will reset this flag after a delay

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    // Set flag to prevent auto-creating new guest session immediately after sign out
    hasExplicitlySignedOut.current = true

    // Clear guest state BEFORE calling supabase signOut
    setGuestId(null)

    // Clear ALL guest data on sign out (including tasks, etc.)
    if (typeof window !== "undefined") {
      // Clear guest hub and guest ID
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("move-hub-guest-") || (key.startsWith("move-hub-") && key.includes("-")))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    }

    await supabase.auth.signOut()

    // Reset the flag after a short delay to allow guest sessions on next visit
    // This prevents auto-creation immediately after signout, but allows it after navigation/refresh
    setTimeout(() => {
      hasExplicitlySignedOut.current = false
    }, 1000)
  }

  const startGuestSession = () => {
    if (!user && !guestId) {
      const newGuestId = crypto.randomUUID()
      if (typeof window !== "undefined") {
        localStorage.setItem("move-hub-guest-id", newGuestId)
      }
      setGuestId(newGuestId)
    }
  }

  const isGuest = !user && !!guestId

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isGuest, guestId, signOut, startGuestSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
