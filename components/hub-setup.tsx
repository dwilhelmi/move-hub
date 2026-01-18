"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useHub } from "@/components/providers/hub-provider"
import { Package, Sparkles } from "lucide-react"

export function HubSetup() {
  const { createHub, isLoading } = useHub()
  const [hubName, setHubName] = useState("My Move")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    await createHub(hubName.trim() || "My Move")
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome to Move Hub!</CardTitle>
          <CardDescription>
            Let&apos;s set up your moving hub to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-6">
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
                  Create My Hub
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>You can invite family members to collaborate from Settings</p>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
