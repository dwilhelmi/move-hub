"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMoveDetails, getTasks, saveMoveDetails, getTimelineEvents, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/app/lib/storage"
import { MoveDetails, Task, TimelineEvent as CustomTimelineEvent } from "@/app/lib/types"
import { Calendar, CheckCircle2, MapPin, AlertCircle, Plus, Edit, Trash2, Star } from "lucide-react"
import { formatDate } from "@/components/house-prep/constants"
import Link from "next/link"
import { TimelineEventForm } from "@/components/timeline-event-form"
import { DeleteConfirmDialog } from "@/components/house-prep/delete-confirm-dialog"

interface DisplayTimelineEvent {
  id: string
  date: Date
  type: "start" | "task" | "move" | "custom"
  title: string
  description?: string
  task?: Task
  customEvent?: CustomTimelineEvent
  isCompleted?: boolean
}

export default function TimelinePage() {
  const [moveDetails, setMoveDetails] = useState<MoveDetails | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [customEvents, setCustomEvents] = useState<CustomTimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<CustomTimelineEvent | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingStartDate, setEditingStartDate] = useState(false)
  const [startDateValue, setStartDateValue] = useState("")
  const todayMarkerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = () => {
      const details = getMoveDetails()
      const taskList = getTasks()
      const events = getTimelineEvents()
      setMoveDetails(details)
      setTasks(taskList)
      setCustomEvents(events)
      setIsLoading(false)
    }

    loadData()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "move-hub-move-details" || e.key === "move-hub-house-prep-tasks" || e.key === "move-hub-timeline-events") {
        loadData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Initialize start date value for editing
  useEffect(() => {
    if (moveDetails?.createdDate && startDateValue === "") {
      const dateStr = new Date(moveDetails.createdDate).toISOString().split("T")[0]
      setStartDateValue(dateStr)
    }
  }, [moveDetails?.createdDate, startDateValue])

  // Scroll to today marker on load
  useEffect(() => {
    if (!isLoading && todayMarkerRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        todayMarkerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }, [isLoading])

  const timelineEvents = useMemo(() => {
    if (!moveDetails?.moveDate) return []

    const events: DisplayTimelineEvent[] = []

    // Add start date event (when move details were created, or today as fallback)
    let startDate = moveDetails.createdDate
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
      startDate = new Date()
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

    // Add custom timeline events
    customEvents.forEach((customEvent) => {
      events.push({
        id: customEvent.id,
        date: new Date(customEvent.date),
        type: "custom",
        title: customEvent.title,
        description: customEvent.description,
        customEvent,
      })
    })

    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [moveDetails, tasks, customEvents])

  const handleSaveEvent = (eventData: Omit<CustomTimelineEvent, "id"> | CustomTimelineEvent) => {
    if ("id" in eventData && eventData.id) {
      // Editing existing event
      updateTimelineEvent(eventData.id, eventData)
      setCustomEvents(customEvents.map((e) => (e.id === eventData.id ? eventData : e)))
    } else {
      // Adding new event
      const newEvent = addTimelineEvent(eventData as Omit<CustomTimelineEvent, "id">)
      setCustomEvents([...customEvents, newEvent])
    }
    setEditingEvent(null)
    setShowAddForm(false)
  }

  const handleDeleteEvent = (id: string) => {
    if (deleteTimelineEvent(id)) {
      setCustomEvents(customEvents.filter((e) => e.id !== id))
    }
    setDeleteConfirm(null)
  }

  const getEventIcon = (type: DisplayTimelineEvent["type"], isCompleted?: boolean) => {
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
      case "custom":
        return <Star className="w-5 h-5 text-purple-500" />
    }
  }

  const getEventColor = (type: DisplayTimelineEvent["type"], isCompleted?: boolean) => {
    switch (type) {
      case "start":
        return "border-primary bg-primary/5"
      case "move":
        return "border-countdown-bg bg-countdown-bg/5"
      case "task":
        return isCompleted
          ? "border-progress-color bg-progress-color/5"
          : "border-border bg-card"
      case "custom":
        return "border-purple-500 bg-purple-500/5"
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Timeline</h1>
            <p className="text-primary-foreground/90">Plan your moving timeline and milestones</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
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

              // Check if we need to show "Today" marker before this event
              const prevEvent = index > 0 ? timelineEvents[index - 1] : null
              const prevDaysUntil = prevEvent ? calculateDaysUntil(prevEvent.date) : null
              // Show marker between past and future events, or at start if first event is future
              const showTodayMarker =
                (prevDaysUntil !== null && prevDaysUntil < 0 && daysUntil > 0) ||
                (index === 0 && daysUntil > 0)

              return (
                <div key={event.id}>
                  {/* Today marker - shows between past and future events */}
                  {showTodayMarker && (
                    <div ref={todayMarkerRef} className="relative flex items-center gap-6 mb-8">
                      <div className="relative z-10 flex items-center justify-center w-16 h-8 shrink-0">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-200 shadow-lg" />
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500 to-transparent" />
                        <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          Today
                        </span>
                        <div className="h-0.5 flex-1 bg-gradient-to-l from-amber-500 to-transparent" />
                      </div>
                    </div>
                  )}

                  <div className="relative flex items-center gap-6">
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

                      {event.type === "start" && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-primary font-medium">Planning Start Date</span>
                            <button
                              onClick={() => {
                                const dateStr = event.date.toISOString().split("T")[0]
                                setStartDateValue(dateStr)
                                setEditingStartDate(true)
                              }}
                              className="ml-auto p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-primary" />
                            </button>
                          </div>
                        </div>
                      )}

                      {event.type === "custom" && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-purple-600 font-medium">Custom Event</span>
                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (event.customEvent) {
                                    setEditingEvent(event.customEvent)
                                  }
                                }}
                                className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4 text-purple-600" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(event.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                  </div>
                </div>
              )
            })}

            {/* Today marker at the end if all events are in the past */}
            {timelineEvents.length > 0 &&
              calculateDaysUntil(timelineEvents[timelineEvents.length - 1].date) < 0 && (
                <div ref={todayMarkerRef} className="relative flex items-center gap-6">
                  <div className="relative z-10 flex items-center justify-center w-16 h-8 shrink-0">
                    <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-200 shadow-lg" />
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500 to-transparent" />
                    <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      Today
                    </span>
                    <div className="h-0.5 flex-1 bg-gradient-to-l from-amber-500 to-transparent" />
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Event Form Dialog */}
      <TimelineEventForm
        event={editingEvent}
        open={showAddForm || editingEvent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false)
            setEditingEvent(null)
          }
        }}
        onSave={handleSaveEvent}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirm !== null}
        type="event"
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteEvent(deleteConfirm)
          }
        }}
      />

      {/* Edit Start Date Dialog */}
      <Dialog open={editingStartDate} onOpenChange={setEditingStartDate}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Planning Start Date</DialogTitle>
            <DialogDescription>
              When did you actually start planning your move?
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (moveDetails && startDateValue) {
                const dateTime = new Date(startDateValue)
                dateTime.setHours(12, 0, 0, 0)
                const updatedDetails = {
                  ...moveDetails,
                  createdDate: dateTime.toISOString(),
                }
                saveMoveDetails(updatedDetails)
                setMoveDetails(updatedDetails)
                setEditingStartDate(false)
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDateValue}
                  onChange={(e) => setStartDateValue(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingStartDate(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Save Date</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}