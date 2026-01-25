"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "./providers/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

/**
 * Modal that prompts guest users to sign up after they've created content
 * Shows after a threshold of activity (e.g., 5 items created)
 * Can be dismissed/snoozed for the session
 */

const ACTIVITY_THRESHOLD = 5 // Show prompt after 5 items created
const STORAGE_KEY_ACTIVITY = "move-hub-guest-activity-count"
const STORAGE_KEY_DISMISSED = "move-hub-guest-prompt-dismissed"

interface GuestSavePromptProps {
  /** Optional: Current activity count (if externally tracked) */
  activityCount?: number
  /** Optional: Custom threshold override */
  threshold?: number
}

export function GuestSavePrompt({
  activityCount: externalActivityCount,
  threshold = ACTIVITY_THRESHOLD,
}: GuestSavePromptProps = {}) {
  const { isGuest } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)
  const [internalActivityCount, setInternalActivityCount] = useState(0)

  // Use external activity count if provided, otherwise use internal tracking
  const activityCount = externalActivityCount ?? internalActivityCount

  useEffect(() => {
    if (!isGuest) {
      return
    }

    // Load activity count and dismissed state from localStorage
    const storedCount = localStorage.getItem(STORAGE_KEY_ACTIVITY)
    const dismissed = sessionStorage.getItem(STORAGE_KEY_DISMISSED)

    if (storedCount) {
      const count = parseInt(storedCount, 10)
      setInternalActivityCount(count)

      // Show prompt if threshold reached and not dismissed this session
      if (count >= threshold && !dismissed) {
        setShowPrompt(true)
      }
    }
  }, [isGuest, threshold])

  const handleDismiss = () => {
    // Dismiss for this session only (user can see it again after page reload)
    sessionStorage.setItem(STORAGE_KEY_DISMISSED, "true")
    setShowPrompt(false)
  }

  const handleSnooze = () => {
    // Snooze - increase threshold by 5 more items
    const newThreshold = activityCount + 5
    localStorage.setItem(STORAGE_KEY_ACTIVITY, newThreshold.toString())
    sessionStorage.setItem(STORAGE_KEY_DISMISSED, "true")
    setShowPrompt(false)
  }

  // Don't show if not a guest
  if (!isGuest) {
    return null
  }

  return (
    <Dialog open={showPrompt} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl">You&apos;re making great progress!</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            You&apos;ve created <span className="font-semibold text-foreground">{activityCount} items</span> in guest mode.
            Your data is only stored locally and could be lost if you clear your browser data.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-2">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
            Sign up to save your progress forever
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• All your data will be saved to the cloud</li>
            <li>• Access your move plan from any device</li>
            <li>• Invite family members to collaborate</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={handleSnooze}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Remind me later
          </Button>
          <Link href="/signup" className="w-full sm:w-auto order-1 sm:order-2">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Sign Up Now
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to track guest activity and increment count
 * Call this whenever a guest creates/modifies data
 */
export function useGuestActivityTracking() {
  const { isGuest } = useAuth()

  const trackActivity = () => {
    if (!isGuest) return

    const storedCount = localStorage.getItem(STORAGE_KEY_ACTIVITY)
    const currentCount = storedCount ? parseInt(storedCount, 10) : 0
    const newCount = currentCount + 1

    localStorage.setItem(STORAGE_KEY_ACTIVITY, newCount.toString())
  }

  return { trackActivity }
}
