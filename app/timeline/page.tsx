"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMoveDetails, getTasks, saveMoveDetails, getTimelineEvents, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/app/lib/storage"
import { MoveDetails, Task, TimelineEvent as CustomTimelineEvent } from "@/app/lib/types"
import { Plus } from "lucide-react"
import Link from "next/link"
import { TimelineEventForm } from "@/components/timeline-event-form"
import { DeleteConfirmDialog } from "@/components/house-prep/delete-confirm-dialog"
import { DisplayTimelineEvent } from "@/components/timeline/types"
import { TimelineList } from "@/components/timeline/timeline-list"
import { EditStartDateDialog } from "@/components/timeline/edit-start-date-dialog"

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

  const timelineEvents = useMemo(() => {
    if (!moveDetails?.moveDate) return []

    const events: DisplayTimelineEvent[] = []

    // Add start date event
    let startDate = moveDetails.createdDate
      ? new Date(moveDetails.createdDate)
      : new Date()

    // If no createdDate exists, save today's date
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

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [moveDetails, tasks, customEvents])

  const handleSaveEvent = (eventData: Omit<CustomTimelineEvent, "id"> | CustomTimelineEvent) => {
    if ("id" in eventData && eventData.id) {
      updateTimelineEvent(eventData.id, eventData)
      setCustomEvents(customEvents.map((e) => (e.id === eventData.id ? eventData : e)))
    } else {
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

  const handleEditStartDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    setStartDateValue(dateStr)
    setEditingStartDate(true)
  }

  const handleSaveStartDate = () => {
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
        <TimelineList
          events={timelineEvents}
          onEditStartDate={handleEditStartDate}
          onEditCustomEvent={setEditingEvent}
          onDeleteCustomEvent={setDeleteConfirm}
        />
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
      <EditStartDateDialog
        open={editingStartDate}
        onOpenChange={setEditingStartDate}
        value={startDateValue}
        onChange={setStartDateValue}
        onSave={handleSaveStartDate}
      />
    </div>
  )
}
