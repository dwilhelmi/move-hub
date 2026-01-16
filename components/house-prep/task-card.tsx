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
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-white border-border hover:border-purple-300 hover:shadow-md'
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
            ? 'bg-red-100 text-red-700'
            : task.priority === 'medium'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
          >
            <Edit className="w-4 h-4 text-purple-600" />
          </button>
          <button 
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
