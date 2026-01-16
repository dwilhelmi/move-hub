"use client"

import { Card } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"
import { formatDate } from "@/components/house-prep/constants"
import Link from "next/link"
import { DisplayTimelineEvent } from "./types"
import { getEventIcon, getEventColor, calculateDaysUntil } from "./constants"

interface TimelineEventCardProps {
  event: DisplayTimelineEvent
  onEditStartDate?: () => void
  onEditCustomEvent?: () => void
  onDeleteCustomEvent?: () => void
}

export function TimelineEventCard({
  event,
  onEditStartDate,
  onEditCustomEvent,
  onDeleteCustomEvent,
}: TimelineEventCardProps) {
  const daysUntil = calculateDaysUntil(event.date)
  const isPast = daysUntil < 0
  const isToday = daysUntil === 0

  return (
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

          {event.type === "start" && onEditStartDate && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary font-medium">Planning Start Date</span>
                <button
                  onClick={onEditStartDate}
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
                  {onEditCustomEvent && (
                    <button
                      onClick={onEditCustomEvent}
                      className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-purple-600" />
                    </button>
                  )}
                  {onDeleteCustomEvent && (
                    <button
                      onClick={onDeleteCustomEvent}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
