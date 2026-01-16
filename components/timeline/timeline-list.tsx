"use client"

import { useEffect, useRef } from "react"
import { TimelineEvent as CustomTimelineEvent } from "@/app/lib/types"
import { DisplayTimelineEvent } from "./types"
import { calculateDaysUntil } from "./constants"
import { TodayMarker } from "./today-marker"
import { TimelineEventCard } from "./timeline-event-card"

interface TimelineListProps {
  events: DisplayTimelineEvent[]
  onEditStartDate: (date: Date) => void
  onEditCustomEvent: (event: CustomTimelineEvent) => void
  onDeleteCustomEvent: (id: string) => void
}

export function TimelineList({
  events,
  onEditStartDate,
  onEditCustomEvent,
  onDeleteCustomEvent,
}: TimelineListProps) {
  const todayMarkerRef = useRef<HTMLDivElement>(null)

  // Scroll to today marker on mount
  useEffect(() => {
    if (todayMarkerRef.current) {
      setTimeout(() => {
        todayMarkerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }, [])

  // Check if we need to show today marker at the end (all events in past)
  const lastEvent = events[events.length - 1]
  const showTodayAtEnd = lastEvent && calculateDaysUntil(lastEvent.date) < 0

  return (
    <div className="relative">
      {/* Timeline line */}
      {events.length > 1 && (
        <div className="absolute left-8 w-0.5 bg-border h-full" />
      )}

      {/* Timeline events */}
      <div className="space-y-8">
        {events.map((event, index) => {
          const daysUntil = calculateDaysUntil(event.date)

          // Check if we need to show "Today" marker before this event
          const prevEvent = index > 0 ? events[index - 1] : null
          const prevDaysUntil = prevEvent ? calculateDaysUntil(prevEvent.date) : null
          const showTodayMarker =
            (prevDaysUntil !== null && prevDaysUntil < 0 && daysUntil > 0) ||
            (index === 0 && daysUntil > 0)

          return (
            <div key={event.id}>
              {showTodayMarker && (
                <TodayMarker ref={todayMarkerRef} className="mb-8" />
              )}

              <TimelineEventCard
                event={event}
                onEditStartDate={
                  event.type === "start"
                    ? () => onEditStartDate(event.date)
                    : undefined
                }
                onEditCustomEvent={
                  event.type === "custom" && event.customEvent
                    ? () => onEditCustomEvent(event.customEvent!)
                    : undefined
                }
                onDeleteCustomEvent={
                  event.type === "custom"
                    ? () => onDeleteCustomEvent(event.id)
                    : undefined
                }
              />
            </div>
          )
        })}

        {/* Today marker at the end if all events are in the past */}
        {showTodayAtEnd && <TodayMarker ref={todayMarkerRef} />}
      </div>
    </div>
  )
}
