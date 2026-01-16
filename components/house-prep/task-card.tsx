"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Task } from "@/app/lib/types"
import { priorityColors, formatDate } from "./constants"
import { Calendar, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface TaskCardProps {
  task: Task
  isExpanded: boolean
  onToggleComplete: (id: string) => void
  onToggleExpand: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskCard({
  task,
  isExpanded,
  onToggleComplete,
  onToggleExpand,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === "completed"

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* Task Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 cursor-pointer"
        onClick={() => onToggleExpand(task.id)}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Checkbox
            id={task.id}
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(task.id)}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          />
          <label
            htmlFor={task.id}
            className={`flex-1 text-sm font-medium leading-tight cursor-pointer truncate ${
              isCompleted ? "line-through text-muted-foreground" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {task.title}
          </label>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">{formatDate(task.dueDate)}</span>
              <span className="sm:hidden">{formatDate(task.dueDate)?.replace(/\s\d{4}/, "")}</span>
            </div>
          )}
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${priorityColors[task.priority] || ""}`}
          >
            {task.priority}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t bg-muted/30">
          <div className="space-y-3 pt-3">
            {task.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{task.description}</p>
              </div>
            )}
            {task.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-sm whitespace-pre-wrap">{task.notes}</p>
              </div>
            )}
            {task.photos && task.photos.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Photos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="aspect-video bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground"
                    >
                      Photo {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {task.completedDate && (
              <div className="text-xs text-muted-foreground">
                Completed: {formatDate(task.completedDate)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
