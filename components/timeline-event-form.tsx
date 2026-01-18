"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { TimelineEvent } from "@/app/lib/types"

interface TimelineEventFormProps {
  event?: TimelineEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (event: Omit<TimelineEvent, "id"> | TimelineEvent) => void
}

export function TimelineEventForm({ event, open, onOpenChange, onSave }: TimelineEventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  })

  useEffect(() => {
    if (event) {
      const eventDate = event.date ? new Date(event.date).toISOString().split("T")[0] : ""
      setFormData({
        title: event.title || "",
        description: event.notes || event.description || "",
        date: eventDate,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
      })
    }
  }, [event, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.date) {
      return
    }

    const dateTime = new Date(formData.date)
    dateTime.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues

    const eventData = {
      title: formData.title.trim(),
      date: dateTime.toISOString(),
      type: event?.type || "event",
      notes: formData.description.trim() || undefined,
    }

    if (event?.id) {
      onSave({ ...eventData, id: event.id })
    } else {
      onSave(eventData)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogDescription>
            {event ? "Update the timeline event details." : "Add a new event to your timeline."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Packing begins"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description or notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Save Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
