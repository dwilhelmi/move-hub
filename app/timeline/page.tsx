"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useHub } from "@/components/providers/hub-provider"
import { HubSetup } from "@/components/hub-setup"
import {
  getMoveDetails,
  saveMoveDetails,
  getTasks,
  getTimelineEvents,
  addTimelineEvent as dbAddTimelineEvent,
  updateTimelineEvent as dbUpdateTimelineEvent,
  deleteTimelineEvent as dbDeleteTimelineEvent,
  MoveDetails,
  Task,
  TimelineEvent,
} from "@/lib/supabase/database"
import { Plus } from "lucide-react"
import Link from "next/link"
import { TimelineEventForm } from "@/components/timeline-event-form"
import { DeleteConfirmDialog } from "@/components/house-prep/delete-confirm-dialog"
import { DisplayTimelineEvent } from "@/components/timeline/types"
import { TimelineList } from "@/components/timeline/timeline-list"
import { EditStartDateDialog } from "@/components/timeline/edit-start-date-dialog"
import { dateToISO, isoToDate } from "@/lib/utils"

export default function TimelinePage() {
  const { hub, isLoading: isHubLoading } = useHub()
  const [moveDetails, setMoveDetails] = useState<MoveDetails | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [customEvents, setCustomEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingStartDate, setEditingStartDate] = useState(false)
  const [startDateValue, setStartDateValue] = useState("")

  const loadData = useCallback(async () => {
    if (!hub) return

    setIsLoading(true)
    const [details, taskList, events] = await Promise.all([
      getMoveDetails(hub.id),
      getTasks(hub.id),
      getTimelineEvents(hub.id),
    ])

    setMoveDetails(details)
    setTasks(taskList)
    setCustomEvents(events)
    setIsLoading(false)
  }, [hub])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Initialize start date value for editing
  useEffect(() => {
    if (moveDetails?.createdDate && startDateValue === "") {
      const dateStr = isoToDate(moveDetails.createdDate)
      setStartDateValue(dateStr)
    }
  }, [moveDetails?.createdDate, startDateValue])

  const timelineEvents = useMemo(() => {
    if (!moveDetails?.moveDate) return []

    const events: DisplayTimelineEvent[] = []

    // Add start date event
    const startDate = moveDetails.createdDate
      ? new Date(moveDetails.createdDate)
      : new Date()

    events.push({
      id: "start",
      date: startDate,
      type: "start",
      title: "Move Planning Started",
      description: `Moving from ${moveDetails.currentAddress || "current location"} to ${moveDetails.newAddress || "new location"}`,
    })

    // Add move date event
    events.push({
      id: "move",
      date: new Date(moveDetails.moveDate),
      type: "move",
      title: "Move Date",
      description: `Final move to ${moveDetails.newAddress || "new location"}`,
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
          task: {
            ...task,
            status: task.status as "pending" | "in-progress" | "completed",
            priority: task.priority as "low" | "medium" | "high",
          },
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
        description: customEvent.notes,
        customEvent: {
          ...customEvent,
          description: customEvent.notes,
        },
      })
    })

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [moveDetails, tasks, customEvents])

  const handleSaveEvent = async (eventData: Omit<TimelineEvent, "id"> | TimelineEvent) => {
    if (!hub) return

    if ("id" in eventData && eventData.id) {
      await dbUpdateTimelineEvent(eventData.id, eventData)
      setCustomEvents(customEvents.map((e) => (e.id === eventData.id ? { ...e, ...eventData } : e)))
    } else {
      const newEvent = await dbAddTimelineEvent(hub.id, eventData as Omit<TimelineEvent, "id">)
      if (newEvent) {
        setCustomEvents([...customEvents, newEvent])
      }
    }
    setEditingEvent(null)
    setShowAddForm(false)
  }

  const handleDeleteEvent = async (id: string) => {
    await dbDeleteTimelineEvent(id)
    setCustomEvents(customEvents.filter((e) => e.id !== id))
    setDeleteConfirm(null)
  }

  const handleEditStartDate = (date: Date) => {
    const dateStr = isoToDate(date.toISOString())
    setStartDateValue(dateStr)
    setEditingStartDate(true)
  }

  const handleSaveStartDate = async () => {
    if (!hub || !moveDetails || !startDateValue) return

    // Convert date string (YYYY-MM-DD) to ISO string (treating input as local date)
    const updatedDetails = {
      ...moveDetails,
      createdDate: dateToISO(startDateValue),
    }
    await saveMoveDetails(hub.id, updatedDetails)
    setMoveDetails(updatedDetails)
    setEditingStartDate(false)
  }

  if (isHubLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!hub) {
    return <HubSetup />
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
        <Card className="bg-primary text-primary-foreground border-0 rounded-2xl p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Timeline</h1>
          <p className="text-sm sm:text-base text-primary-foreground/90">Plan your moving timeline and milestones</p>
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
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Timeline</h1>
            <p className="text-sm sm:text-base text-primary-foreground/90">Plan your moving timeline and milestones</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 w-full sm:w-auto"
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
