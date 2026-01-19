"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/auth-provider"
import { useHub } from "@/components/providers/hub-provider"
import { Settings, Users, UserPlus, Trash2, Crown, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { hub, isLoading, isOwner, updateHubName, inviteMember, removeMember } = useHub()
  const [hubName, setHubName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const router = useRouter()

  const handleUpdateName = async () => {
    if (!hubName.trim()) return
    await updateHubName(hubName.trim())
    setIsEditingName(false)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError(null)
    setInviteSuccess(false)
    setIsInviting(true)

    const result = await inviteMember(inviteEmail)

    if (result.success) {
      setInviteSuccess(true)
      setInviteEmail("")
    } else {
      setInviteError(result.error || "Failed to invite member")
    }

    setIsInviting(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
        <Card className="p-12">
          <div className="text-center text-muted-foreground">Loading...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Header */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-8">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-primary-foreground/90">
              Manage your hub and account
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Account Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </Card>

        {/* Hub Settings */}
        {hub && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Hub Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hubName">Hub Name</Label>
                {isEditingName ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="hubName"
                      value={hubName}
                      onChange={(e) => setHubName(e.target.value)}
                      placeholder="My Move"
                    />
                    <Button onClick={handleUpdateName}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditingName(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium">{hub.name}</p>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHubName(hub.name)
                          setIsEditingName(true)
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Members */}
        {hub && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h2 className="text-xl font-bold">Members</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {hub.members.length} member{hub.members.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {hub.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {(member.profile?.display_name || member.profile?.email || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.profile?.display_name || member.profile?.email}
                        {member.user_id === user?.id && (
                          <span className="text-muted-foreground ml-1">(you)</span>
                        )}
                      </p>
                      {member.profile?.display_name && (
                        <p className="text-sm text-muted-foreground">
                          {member.profile.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "owner" && (
                      <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                        <Crown className="w-3 h-3" />
                        Owner
                      </span>
                    )}
                    {isOwner && member.user_id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                        onClick={() => removeMember(member.user_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Invite Form */}
            {isOwner && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </h3>
                <form onSubmit={handleInvite} className="space-y-4">
                  {inviteError && (
                    <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      {inviteError}
                    </div>
                  )}
                  {inviteSuccess && (
                    <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      Invitation sent! They will be added when they sign up.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="partner@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={isInviting}>
                      {isInviting ? "Inviting..." : "Invite"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If they already have an account, they&apos;ll be added immediately.
                    Otherwise, they&apos;ll be added when they sign up with this email.
                  </p>
                </form>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
