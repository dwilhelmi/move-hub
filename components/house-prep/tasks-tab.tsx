"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Tasks</h2>
        <Button onClick={onAddClick} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <TaskFilter value={filter} onChange={setFilter} />

      {/* Tasks by Category */}
      <div className="space-y-6">
        {categoryOrder.map((category) => {
          const categoryTasks = tasksByCategory[category]
          if (categoryTasks.length === 0) return null

          const categoryCompleted = categoryTasks.filter(
            (task) => task.status === "completed"
          ).length

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {categoryLabels[category]}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({categoryCompleted}/{categoryTasks.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
