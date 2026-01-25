"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-provider"
import { Hub, HubMember, Profile } from "@/lib/supabase/types"

interface HubWithMembers extends Hub {
  members: (HubMember & { profile: Profile | null })[]
}

interface HubContextType {
  hub: HubWithMembers | null
  isLoading: boolean
  isOwner: boolean
  isGuest: boolean
  refreshHub: () => Promise<void>
  createHub: (name?: string) => Promise<Hub | null>
  createGuestHub: (name?: string) => void
  updateHubName: (name: string) => Promise<void>
  inviteMember: (email: string) => Promise<{ success: boolean; error?: string }>
  removeMember: (userId: string) => Promise<void>
}

const HubContext = createContext<HubContextType>({
  hub: null,
  isLoading: true,
  isOwner: false,
  isGuest: false,
  refreshHub: async () => {},
  createHub: async () => null,
  createGuestHub: () => {},
  updateHubName: async () => {},
  inviteMember: async () => ({ success: false }),
  removeMember: async () => {},
})

export function HubProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest, guestId } = useAuth()
  const [hub, setHub] = useState<HubWithMembers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchHub = useCallback(async () => {
    // Guest mode: load hub from localStorage
    if (isGuest && guestId) {
      const storedHub = typeof window !== "undefined"
        ? localStorage.getItem(`move-hub-guest-hub-${guestId}`)
        : null

      if (storedHub) {
        try {
          const parsedHub = JSON.parse(storedHub)
          setHub(parsedHub)
        } catch (error) {
          console.error("Error parsing guest hub:", error)
          setHub(null)
        }
      } else {
        setHub(null)
      }
      setIsLoading(false)
      return
    }

    // Not logged in and not guest
    if (!user) {
      setHub(null)
      setIsLoading(false)
      return
    }

    try {
      // Get user's hub membership
      const { data: membership } = await supabase
        .from("hub_members")
        .select("hub_id")
        .eq("user_id", user.id)
        .single()

      if (!membership) {
        setHub(null)
        setIsLoading(false)
        return
      }

      // Get hub with members
      const { data: hubData } = await supabase
        .from("hubs")
        .select("*")
        .eq("id", membership.hub_id)
        .single()

      if (!hubData) {
        setHub(null)
        setIsLoading(false)
        return
      }

      // Get members with profiles
      const { data: members } = await supabase
        .from("hub_members")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("hub_id", membership.hub_id)

      setHub({
        ...hubData,
        members: members || [],
      })
    } catch (error) {
      console.error("Error fetching hub:", error)
      setHub(null)
    } finally {
      setIsLoading(false)
    }
  }, [user, isGuest, guestId, supabase])

  useEffect(() => {
    fetchHub()
  }, [fetchHub])

  const createHub = async (name: string = "My Move") => {
    if (!user) return null

    try {
      // Create the hub (trigger automatically adds creator as owner)
      const { data: newHub, error: hubError } = await supabase
        .from("hubs")
        .insert({ name, created_by: user.id })
        .select()
        .single()

      if (hubError) throw hubError

      await fetchHub()
      return newHub
    } catch (error) {
      console.error("Error creating hub:", error)
      return null
    }
  }

  const createGuestHub = (name: string = "My Move") => {
    if (!isGuest || !guestId) return

    // Create guest hub with synthetic structure matching HubWithMembers
    const guestHub: HubWithMembers = {
      id: crypto.randomUUID(),
      name,
      created_by: guestId,
      created_at: new Date().toISOString(),
      members: [
        {
          hub_id: "", // Will be set below
          user_id: guestId,
          role: "owner",
          joined_at: new Date().toISOString(),
          profile: null,
        },
      ],
    }
    guestHub.members[0].hub_id = guestHub.id

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`move-hub-guest-hub-${guestId}`, JSON.stringify(guestHub))
    }

    // Update state
    setHub(guestHub)
  }

  const updateHubName = async (name: string) => {
    if (!hub) return

    // Guest mode: update in localStorage
    if (isGuest && guestId) {
      const updatedHub = { ...hub, name }
      if (typeof window !== "undefined") {
        localStorage.setItem(`move-hub-guest-hub-${guestId}`, JSON.stringify(updatedHub))
      }
      setHub(updatedHub)
      return
    }

    // Database mode
    await supabase.from("hubs").update({ name }).eq("id", hub.id)
    await fetchHub()
  }

  const inviteMember = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!hub || !user) return { success: false, error: "No hub found" }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already a member
    const existingMember = hub.members.find(
      (m) => m.profile?.email.toLowerCase() === normalizedEmail
    )
    if (existingMember) {
      return { success: false, error: "This person is already a member" }
    }

    // Check if user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .single()

    if (profile) {
      // User exists, add them directly
      const { error } = await supabase
        .from("hub_members")
        .insert({ hub_id: hub.id, user_id: profile.id, role: "member" })

      if (error) {
        return { success: false, error: "Failed to add member" }
      }

      await fetchHub()
      return { success: true }
    } else {
      // User doesn't exist, create an invite
      const { error } = await supabase
        .from("hub_invites")
        .insert({ hub_id: hub.id, email: normalizedEmail, invited_by: user.id })

      if (error) {
        if (error.code === "23505") {
          return { success: false, error: "Invite already sent to this email" }
        }
        return { success: false, error: "Failed to send invite" }
      }

      return { success: true }
    }
  }

  const removeMember = async (userId: string) => {
    if (!hub) return

    await supabase
      .from("hub_members")
      .delete()
      .eq("hub_id", hub.id)
      .eq("user_id", userId)

    await fetchHub()
  }

  const isOwner = hub?.members.some(
    (m) => m.user_id === (user?.id || guestId) && m.role === "owner"
  ) ?? false

  return (
    <HubContext.Provider
      value={{
        hub,
        isLoading,
        isOwner,
        isGuest,
        refreshHub: fetchHub,
        createHub,
        createGuestHub,
        updateHubName,
        inviteMember,
        removeMember,
      }}
    >
      {children}
    </HubContext.Provider>
  )
}

export const useHub = () => {
  const context = useContext(HubContext)
  if (context === undefined) {
    throw new Error("useHub must be used within a HubProvider")
  }
  return context
}
