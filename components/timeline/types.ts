import { Task, TimelineEvent as CustomTimelineEvent } from "@/app/lib/types"

export interface DisplayTimelineEvent {
  id: string
  date: Date
  type: "start" | "task" | "move" | "custom"
  title: string
  description?: string
  task?: Task
  customEvent?: CustomTimelineEvent
  isCompleted?: boolean
}
