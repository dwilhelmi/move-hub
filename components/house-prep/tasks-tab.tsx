"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Task, TaskCategory, TaskStatus } from "@/app/lib/types"
import { TaskCard } from "./task-card"
import { TaskFilter } from "./task-filter"
import { categoryLabels, categoryOrder } from "./constants"
import { Plus } from "lucide-react"

type FilterType = "all" | TaskCategory | TaskStatus

interface TasksTabProps {
  tasks: Task[]
  expandedTasks: Set<string>
  onToggleTask: (id: string) => void
  onToggleExpand: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddClick: () => void
}

export function TasksTab({
  tasks,
  expandedTasks,
  onToggleTask,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddClick,
}: TasksTabProps) {
  const [filter, setFilter] = useState<FilterType>("all")

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks

    // Check if filter is a category
    if (categoryOrder.includes(filter as TaskCategory)) {
      return tasks.filter((task) => task.category === filter)
    }

    // Otherwise filter by status
    return tasks.filter((task) => task.status === filter)
  }, [tasks, filter])

  // Group filtered tasks by category
  const tasksByCategory = useMemo(() => {
    return categoryOrder.reduce((acc, category) => {
      acc[category] = filteredTasks.filter((task) => task.category === category)
      return acc
    }, {} as Record<TaskCategory, Task[]>)
  }, [filteredTasks])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Filter:</span>
          <TaskFilter value={filter} onChange={setFilter} />
        </div>
        <Button onClick={onAddClick} className="flex items-center gap-2 bg-primary hover:bg-primary/90 font-semibold rounded-lg shadow-lg hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Tasks by Category */}
      <div className="space-y-3">
        {categoryOrder.map((category) => {
          const categoryTasks = tasksByCategory[category]
          if (categoryTasks.length === 0) return null

          const categoryCompleted = categoryTasks.filter(
            (task) => task.status === "completed"
          ).length

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold">{categoryLabels[category]}</h3>
                <span className="text-sm text-muted-foreground">({categoryCompleted}/{categoryTasks.length})</span>
              </div>
              {categoryTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedTasks.has(task.id)}
                  onToggleComplete={onToggleTask}
                  onToggleExpand={onToggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
