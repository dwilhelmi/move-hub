"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Plus, DollarSign, Calendar, Package } from "lucide-react"
import { useHub } from "@/components/providers/hub-provider"
import { HubSetup } from "@/components/hub-setup"
import {
  getMoveDetails,
  saveMoveDetails,
  getTasks,
  addTask as dbAddTask,
  addExpense as dbAddExpense,
  addTimelineEvent as dbAddTimelineEvent,
  addInventoryItem as dbAddInventoryItem,
  MoveDetails,
  Task,
  Expense,
  TimelineEvent,
  InventoryItem,
} from "@/lib/supabase/database"
import { TaskForm } from "@/components/task-form"
import { ExpenseForm } from "@/components/expense-form"
import { TimelineEventForm } from "@/components/timeline-event-form"
import { InventoryItemForm } from "@/components/inventory-item-form"
import { ProgressOverview } from "@/components/house-prep/progress-overview"
import { MovingCountdown } from "@/components/moving-countdown"
import { MoveDetailsCard } from "@/components/move-details-card"
import { MoveDetailsForm } from "@/components/move-details-form"

export default function Home() {
  const { hub, isLoading: isHubLoading } = useHub()
  const [moveDetails, setMoveDetails] = useState<MoveDetails | null>(null)
  const [isLoadingMoveDetails, setIsLoadingMoveDetails] = useState(true)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [showMoveDetailsForm, setShowMoveDetailsForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showInventoryForm, setShowInventoryForm] = useState(false)

  const loadData = useCallback(async () => {
    if (!hub) return

    setIsLoadingMoveDetails(true)
    const [details, tasks] = await Promise.all([
      getMoveDetails(hub.id),
      getTasks(hub.id),
    ])

    setMoveDetails(details)
    const completed = tasks.filter((task) => task.status === "completed").length
    setTasksCompleted(completed)
    setTotalTasks(tasks.length)
    setIsLoadingMoveDetails(false)
  }, [hub])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveMoveDetails = async (details: MoveDetails) => {
    if (!hub) return
    await saveMoveDetails(hub.id, details)
    setMoveDetails(details)
  }

  const handleSaveTask = async (taskData: Omit<Task, "id">) => {
    if (!hub) return
    await dbAddTask(hub.id, taskData)
    setShowTaskForm(false)
    // Refresh task count
    const tasks = await getTasks(hub.id)
    const completed = tasks.filter((task) => task.status === "completed").length
    setTasksCompleted(completed)
    setTotalTasks(tasks.length)
  }

  const handleSaveExpense = async (expenseData: Omit<Expense, "id">) => {
    if (!hub) return
    await dbAddExpense(hub.id, expenseData)
    setShowExpenseForm(false)
  }

  const handleSaveEvent = async (eventData: Omit<TimelineEvent, "id">) => {
    if (!hub) return
    await dbAddTimelineEvent(hub.id, eventData)
    setShowEventForm(false)
  }

  const handleSaveInventoryItem = async (itemData: Omit<InventoryItem, "id">) => {
    if (!hub) return
    await dbAddInventoryItem(hub.id, itemData)
    setShowInventoryForm(false)
  }

  // Show loading while checking hub
  if (isHubLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Show hub setup if no hub
  if (!hub) {
    return <HubSetup />
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Welcome Banner */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl overflow-hidden relative">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <CardHeader className="relative p-8">
          <CardTitle className="text-4xl font-bold mb-2">
            {hub.name}
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 text-lg">
            Your complete companion for planning and executing your move
          </CardDescription>
        </CardHeader>
      </Card>

      <MoveDetailsCard
        moveDetails={moveDetails}
        isLoading={isLoadingMoveDetails}
        onEdit={() => setShowMoveDetailsForm(true)}
      />

      {/* Quick Stats */}
      {moveDetails?.moveDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MovingCountdown targetDate={new Date(moveDetails.moveDate)} />

          <Link href="/house-prep" className="block">
            <ProgressOverview
              completedCount={tasksCompleted}
              totalCount={totalTasks}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
          </Link>
        </div>
      )}

      {!moveDetails?.moveDate && (
        <div className="mb-8">
          <Link href="/house-prep" className="block">
            <ProgressOverview
              completedCount={tasksCompleted}
              totalCount={totalTasks}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
          </Link>
        </div>
      )}

      <MoveDetailsForm
        moveDetails={moveDetails}
        open={showMoveDetailsForm}
        onOpenChange={setShowMoveDetailsForm}
        onSave={handleSaveMoveDetails}
      />

      {/* Quick Actions */}
      <Card className="p-6">
        <CardTitle className="text-xl font-bold mb-4">Quick Actions</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-3 p-4 bg-muted hover:bg-accent rounded-xl border-2 border-border hover:border-primary transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Add Task</span>
          </button>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-3 p-4 bg-muted hover:bg-accent rounded-xl border-2 border-border hover:border-primary transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Add Expense</span>
          </button>
          <button
            onClick={() => setShowEventForm(true)}
            className="flex items-center gap-3 p-4 bg-muted hover:bg-accent rounded-xl border-2 border-border hover:border-primary transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Add Event</span>
          </button>
          <button
            onClick={() => setShowInventoryForm(true)}
            className="flex items-center gap-3 p-4 bg-muted hover:bg-accent rounded-xl border-2 border-border hover:border-primary transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Add Item</span>
          </button>
        </div>
      </Card>

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSave={handleSaveTask}
      />

      <ExpenseForm
        open={showExpenseForm}
        onOpenChange={setShowExpenseForm}
        onSave={handleSaveExpense}
      />

      <TimelineEventForm
        open={showEventForm}
        onOpenChange={setShowEventForm}
        onSave={handleSaveEvent}
      />

      <InventoryItemForm
        open={showInventoryForm}
        onOpenChange={setShowInventoryForm}
        onSave={handleSaveInventoryItem}
      />
    </div>
  )
}
