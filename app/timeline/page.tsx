"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { getMoveDetails, getTasks, saveMoveDetails } from "@/app/lib/storage"
import { MoveDetails, Task } from "@/app/lib/types"
import { Calendar, CheckCircle2, MapPin, AlertCircle } from "lucide-react"
import { formatDate } from "@/components/house-prep/constants"
import Link from "next/link"

interface TimelineEvent {
  id: string
  date: Date
  type: "start" | "task" | "move"
  title: string
  description?: string
  task?: Task
  isCompleted?: boolean
}

export default function TimelinePage() {
  const [moveDetails, setMoveDetails] = useState<MoveDetails | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const details = getMoveDetails()
      const taskList = getTasks()
      setMoveDetails(details)
      setTasks(taskList)
      setIsLoading(false)
    }

    loadData()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "move-hub-move-details" || e.key === "move-hub-house-prep-tasks") {
        loadData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const timelineEvents = useMemo(() => {
    if (!moveDetails?.moveDate) return []

    const events: TimelineEvent[] = []

    // Add start date event (when move details were created, or today as fallback)
    const startDate = moveDetails.createdDate
      ? new Date(moveDetails.createdDate)
      : new Date() // Use today's date as fallback

    // If no createdDate exists, save today's date for future reference
    if (!moveDetails.createdDate) {
      const updatedDetails = {
        ...moveDetails,
        createdDate: new Date().toISOString()
      }
      saveMoveDetails(updatedDetails)
      setMoveDetails(updatedDetails)
    }

    events.push({
      id: "start",
      date: startDate,
      type: "start",
      title: "Move Planning Started",
      description: `Moving from ${moveDetails.fromLocation} to ${moveDetails.toLocation}`,
    })

    // Add move date event
    events.push({
      id: "move",
      date: new Date(moveDetails.moveDate),
      type: "move",
      title: "Move Date",
      description: `Final move to ${moveDetails.toLocation}`,
    })

    // Add tasks with due dates
    tasks
      .filter((task) => task.dueDate)
      .forEach((task) => {
        events.push({
          id: task.id,
          date: new Date(task.dueDate!),
          type: "task",
          title: task.title,
          description: task.category,
          task,
          isCompleted: task.status === "completed",
        })
      })

    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [moveDetails, tasks])

  const getEventIcon = (type: TimelineEvent["type"], isCompleted?: boolean) => {
    switch (type) {
      case "start":
        return <MapPin className="w-5 h-5 text-primary" />
      case "move":
        return <Calendar className="w-5 h-5 text-countdown-bg" />
      case "task":
        return isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-progress-color" />
        ) : (
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
        )
    }
  }

  const getEventColor = (type: TimelineEvent["type"], isCompleted?: boolean) => {
    switch (type) {
      case "start":
        return "border-primary bg-primary/5"
      case "move":
        return "border-countdown-bg bg-countdown-bg/5"
      case "task":
        return isCompleted
          ? "border-progress-color bg-progress-color/5"
          : "border-border bg-card"
    }
  }

  const calculateDaysUntil = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    const diff = targetDate.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
        <Card className="p-12">
          <div className="text-center text-muted-foreground">Loading timeline...</div>
        </Card>
      </div>
    )
  }

  if (!moveDetails?.moveDate) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
        <Card className="bg-primary text-primary-foreground border-0 rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">Timeline</h1>
          <p className="text-primary-foreground/90">Plan your moving timeline and milestones</p>
        </Card>

        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Please set up your move details to view your timeline
          </p>
          <Link href="/" className="text-primary hover:underline font-semibold">
            Go to Dashboard
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Header */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Timeline</h1>
        <p className="text-primary-foreground/90">Plan your moving timeline and milestones</p>
      </Card>

      {timelineEvents.length === 0 ? (
        <Card className="p-8">
          <p className="text-muted-foreground text-center">
            No timeline events yet. Add due dates to your tasks to see them on the timeline.
          </p>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line - stops at the center of the last event's icon */}
          {timelineEvents.length > 1 && (
            <div 
              className="absolute left-8 w-0.5 bg-border h-full"
            ></div>
          )}

          {/* Timeline events */}
          <div className="space-y-8">
            {timelineEvents.map((event, index) => {
              const daysUntil = calculateDaysUntil(event.date)
              const isPast = daysUntil < 0
              const isToday = daysUntil === 0
              const isUpcoming = daysUntil > 0

              return (
                <div key={event.id} className="relative flex items-center gap-6">
                  {/* Icon */}
                  <span className="bg-white rounded-full">
                    <div
                      className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 ${getEventColor(
                        event.type,
                        event.isCompleted
                      )} shrink-0`}
                    >
                      {getEventIcon(event.type, event.isCompleted)}
                    </div>
                  </span>

                  {/* Content */}
                  <Card
                    className={`flex-1 border-2 ${
                      isPast && event.type === "task" && !event.isCompleted
                        ? "opacity-60"
                        : ""
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-foreground">
                            {formatDate(event.date.toISOString())}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isPast
                              ? `${Math.abs(daysUntil)} days ago`
                              : isToday
                              ? "Today"
                              : `In ${daysUntil} days`}
                          </div>
                        </div>
                      </div>

                      {event.type === "task" && event.task && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                event.task.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : event.task.priority === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {event.task.priority}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {event.task.category}
                            </span>
                            {event.isCompleted && (
                              <span className="text-xs text-progress-color font-medium">
                                ✓ Completed
                              </span>
                            )}
                            <Link
                              href="/house-prep"
                              className="ml-auto text-xs text-primary hover:underline"
                            >
                              View Task →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}