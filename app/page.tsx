"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Wrench } from "lucide-react"
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
      {/* Welcome Banner */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl overflow-hidden relative">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <CardHeader className="relative p-8">
          <CardTitle className="text-4xl font-bold mb-2">
            Welcome to Move Hub
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 text-lg">
            Your complete companion for planning and executing your move
          </CardDescription>
        </CardHeader>
      </Card>

      <MoveDetailsCard
        moveDetails={moveDetails}
        isLoading={isLoadingMoveDetails}
        onEdit={() => setShowMoveDetailsForm(true)}
      />

      {/* Quick Stats */}
      {moveDetails?.moveDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MovingCountdown targetDate={new Date(moveDetails.moveDate)} />

          <Link href="/house-prep" className="block">
            <ProgressOverview
              completedCount={tasksCompleted}
              totalCount={totalTasks}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
          </Link>
        </div>
      )}

      {!moveDetails?.moveDate && (
        <div className="mb-8">
          <Link href="/house-prep" className="block">
            <ProgressOverview
              completedCount={tasksCompleted}
              totalCount={totalTasks}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
          </Link>
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

      {/* Quick Actions */}
      <Card className="p-6">
        <CardTitle className="text-xl font-bold mb-4">Quick Actions</CardTitle>
        <Link href="/house-prep">
          <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-slate-200 hover:border-primary transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">House Prep Tracker</span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
        </Link>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Timeline, Inventory, Budget, and SF Guide coming soon
        </p>
      </Card>
    </div>
  )
}
