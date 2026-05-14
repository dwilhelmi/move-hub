"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { useDataProvider } from "@/lib/data/hooks"
import { migrateGuestDataToDatabase } from "@/lib/data/migration"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Loader2 } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { guestId } = useAuth()
  const provider = useDataProvider()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // If email confirmation is required
      if (data.user && !data.session) {
        // Store guest ID in localStorage with a pending migration flag
        // This will be picked up after email confirmation
        if (guestId) {
          localStorage.setItem("move-hub-pending-migration-user-id", data.user.id)
        }
        router.push("/login?message=Check your email to confirm your account")
        return
      }

      // If auto-confirmed and we have guest data, migrate it
      if (data.user && data.session && guestId) {
        setIsMigrating(true)
        const migrationResult = await migrateGuestDataToDatabase(
          guestId,
          data.user.id,
          provider
        )

        if (!migrationResult.success) {
          console.error("Migration failed:", migrationResult.error)
          // Don't block signup - just log the error
          // Guest data remains in localStorage and user can still use the app
        }
        setIsMigrating(false)
      }

      // Redirect to home
      router.push("/")
      router.refresh()
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Get started with Move Hub</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {isMigrating && (
              <div className="p-3 text-sm bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving your guest data...</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || isMigrating}>
              {isLoading ? "Creating account..." : isMigrating ? "Migrating data..." : "Create account"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
