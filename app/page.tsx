"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { getTasks, getMoveDetails, saveMoveDetails } from "@/app/lib/storage"
import { ProgressOverview } from "@/components/house-prep/progress-overview"
import { MovingCountdown } from "@/components/moving-countdown"
import { MoveDetailsCard } from "@/components/move-details-card"
import { MoveDetailsForm } from "@/components/move-details-form"
import { MoveDetails } from "@/app/lib/types"

// Module-level cache to store move details across remounts (for navigation)
let cachedMoveDetails: MoveDetails | null = null

export default function Home() {
  // Initialize with cached value if available (from previous mount), otherwise start with null
  const [moveDetails, setMoveDetails] = useState<MoveDetails | null>(cachedMoveDetails)
  const [isLoadingMoveDetails, setIsLoadingMoveDetails] = useState(cachedMoveDetails === null)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [showMoveDetailsForm, setShowMoveDetailsForm] = useState(false)

  useEffect(() => {
    // Load move details from storage
    const details = getMoveDetails()
    setMoveDetails(details)
    cachedMoveDetails = details
    setIsLoadingMoveDetails(false)

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "move-hub-move-details") {
        const updated = getMoveDetails()
        setMoveDetails(updated)
        cachedMoveDetails = updated
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    const loadTaskStats = () => {
      const tasks = getTasks()
      const completed = tasks.filter((task) => task.status === "completed").length
      setTasksCompleted(completed)
      setTotalTasks(tasks.length)
    }

    loadTaskStats()

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "move-hub-house-prep-tasks") {
        loadTaskStats()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(loadTaskStats, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Move Hub</h1>
        <p className="text-muted-foreground text-lg">
          Your complete companion for planning and executing your move
        </p>
      </div>

      <MoveDetailsCard
        moveDetails={moveDetails}
        isLoading={isLoadingMoveDetails}
        onEdit={() => setShowMoveDetailsForm(true)}
      />

      {/* Quick Stats */}
      {moveDetails?.moveDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MovingCountdown targetDate={new Date(moveDetails.moveDate)} />

          <ProgressOverview
            completedCount={tasksCompleted}
            totalCount={totalTasks}
          />
        </div>
      )}

      {!moveDetails?.moveDate && (
        <div className="mb-8">
          <ProgressOverview
            completedCount={tasksCompleted}
            totalCount={totalTasks}
          />
        </div>
      )}

      <MoveDetailsForm
        moveDetails={moveDetails}
        open={showMoveDetailsForm}
        onOpenChange={setShowMoveDetailsForm}
        onSave={(details) => {
          saveMoveDetails(details)
          setMoveDetails(details)
          cachedMoveDetails = details
        }}
      />

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access your active sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Link href="/house-prep">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  House Prep Tracker
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground text-center py-2">
              Timeline, Inventory, Budget, and SF Guide coming soon
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
