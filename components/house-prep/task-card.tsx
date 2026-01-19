"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Task } from "@/app/lib/types"
import { Edit, Trash2, ChevronDown } from "lucide-react"
import { formatDate } from "./constants"

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
    <div
      className={`group border-2 rounded-xl p-4 transition-all ${
        isCompleted
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-muted/50 dark:bg-muted/30 border-border hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          id={task.id}
          checked={isCompleted}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="w-6 h-6 rounded-lg border-2 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <label
            htmlFor={task.id}
            className={`font-medium cursor-pointer ${
              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {task.title}
          </label>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
          task.priority === 'high'
            ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
            : task.priority === 'medium'
            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
            : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
        }`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-950/50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
          >
            <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </button>
          <button
            className="p-2 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
          <button
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(task.id)
            }}
          >
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="space-y-3">
            {task.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{task.description}</p>
              </div>
            )}
            {task.dueDate && (
              <div className="text-xs text-muted-foreground">
                Due: {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
