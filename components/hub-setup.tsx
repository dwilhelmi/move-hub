"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useHub } from "@/components/providers/hub-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Package, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"

export function HubSetup() {
  const { createHub, createGuestHub, isLoading } = useHub()
  const { isGuest } = useAuth()
  const [hubName, setHubName] = useState("My Move")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    if (isGuest) {
      createGuestHub(hubName.trim() || "My Move")
    } else {
      await createHub(hubName.trim() || "My Move")
    }

    setIsCreating(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome to Move Hub!</CardTitle>
          <CardDescription>
            {isGuest
              ? "Create a temporary hub to try out Move Hub"
              : "Let's set up your moving hub to get started"
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-6">
            {isGuest && (
              <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  <p className="font-medium mb-1">Guest Mode</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Your data is stored locally and will be lost if you clear your browser data.{" "}
                    <Link href="/signup" className="underline hover:no-underline font-medium">
                      Sign up
                    </Link>{" "}
                    to save your data permanently.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="hubName">Give your move a name</Label>
              <Input
                id="hubName"
                value={hubName}
                onChange={(e) => setHubName(e.target.value)}
                placeholder="e.g., SF to NYC Move, New House 2024"
              />
              <p className="text-sm text-muted-foreground">
                You can change this later in settings
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? (
                "Creating..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGuest ? "Create Temporary Hub" : "Create My Hub"}
                </>
              )}
            </Button>

            {!isGuest && (
              <div className="text-center text-sm text-muted-foreground">
                <p>You can invite family members to collaborate from Settings</p>
              </div>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
