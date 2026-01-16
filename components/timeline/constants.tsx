import { Calendar, CheckCircle2, MapPin, AlertCircle, Star } from "lucide-react"
import { DisplayTimelineEvent } from "./types"

export function calculateDaysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const diff = targetDate.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getEventIcon(type: DisplayTimelineEvent["type"], isCompleted?: boolean) {
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

export function getEventColor(type: DisplayTimelineEvent["type"], isCompleted?: boolean): string {
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
