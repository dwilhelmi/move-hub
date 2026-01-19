"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { useHub } from "@/components/providers/hub-provider"
import { HubSetup } from "@/components/hub-setup"
import {
  getTasks,
  addTask as dbAddTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  Task,
} from "@/lib/supabase/database"
import { TaskForm } from "@/components/task-form"
import { ProgressOverview } from "@/components/move-prep/progress-overview"
import { TasksTab } from "@/components/move-prep/tasks-tab"
import { DeleteConfirmDialog } from "@/components/move-prep/delete-confirm-dialog"

export default function MovePrepPage() {
  const { hub, isLoading: isHubLoading } = useHub()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)

  const loadData = useCallback(async () => {
    if (!hub) return

    setIsLoading(true)
    const loadedTasks = await getTasks(hub.id)

    setTasks(loadedTasks)
    setIsLoading(false)
  }, [hub])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newStatus: Task["status"] =
      task.status === "completed" ? "pending" : "completed"

    await dbUpdateTask(id, { status: newStatus })
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }

  const toggleExpanded = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSaveTask = async (taskData: Omit<Task, "id"> | Task) => {
    if (!hub) return

    if ("id" in taskData && taskData.id) {
      // Editing existing task
      await dbUpdateTask(taskData.id, taskData)
      setTasks(tasks.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)))
    } else {
      // Adding new task
      const newTask = await dbAddTask(hub.id, taskData as Omit<Task, "id">)
      if (newTask) {
        setTasks([...tasks, newTask])
      }
    }
    setEditingTask(null)
    setShowAddTaskForm(false)
  }

  const handleDeleteTask = async (id: string) => {
    await dbDeleteTask(id)
    setTasks(tasks.filter((t) => t.id !== id))
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setDeleteConfirm(null)
  }

  const completedCount = tasks.filter((task) => task.status === "completed").length
  const totalCount = tasks.length

  if (isHubLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!hub) {
    return <HubSetup />
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Header */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Move Prep Tracker</h1>
        <p className="text-sm sm:text-base text-primary-foreground/90">Track your progress getting ready for your move</p>
      </Card>

      <ProgressOverview
        completedCount={completedCount}
        totalCount={totalCount}
        className="mb-6"
      />

      {/* Tasks */}
      <Card className="p-6">
        <TasksTab
          tasks={tasks}
          expandedTasks={expandedTasks}
          onToggleTask={toggleTask}
          onToggleExpand={toggleExpanded}
          onEdit={setEditingTask}
          onDelete={(id) => setDeleteConfirm(id)}
          onAddClick={() => setShowAddTaskForm(true)}
        />
      </Card>

      {/* Task Form Dialog */}
      <TaskForm
        task={editingTask}
        open={showAddTaskForm || editingTask !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddTaskForm(false)
            setEditingTask(null)
          }
        }}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirm !== null}
        type="task"
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteTask(deleteConfirm)
          }
        }}
      />
    </div>
  )
}
