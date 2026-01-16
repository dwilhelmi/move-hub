"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Task, Expense, TaskCategory } from "@/app/lib/types"
import {
  getTasks,
  updateTask,
  saveTasks,
  addTask,
  deleteTask,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "@/app/lib/storage"
import defaultTasks from "@/app/data/house-prep-defaults.json"
import { TaskForm } from "@/components/task-form"
import { ExpenseForm } from "@/components/expense-form"
import { ProgressOverview } from "@/components/house-prep/progress-overview"
import { TasksTab } from "@/components/house-prep/tasks-tab"
import { ExpensesTab } from "@/components/house-prep/expenses-tab"
import { DeleteConfirmDialog } from "@/components/house-prep/delete-confirm-dialog"

export default function HousePrepPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "task" | "expense"; id: string } | null>(null)
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false)

  // Load tasks and expenses from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const storedTasks = getTasks()

      // If no tasks exist, initialize with defaults
      if (storedTasks.length === 0) {
        const initialTasks: Task[] = defaultTasks.map((task) => ({
          ...task,
          status: task.status as Task["status"],
          priority: task.priority as Task["priority"],
          category: task.category as TaskCategory,
        }))
        saveTasks(initialTasks)
        setTasks(initialTasks)
      } else {
        setTasks(storedTasks)
      }

      const storedExpenses = getExpenses()
      setExpenses(storedExpenses)

      setIsInitialized(true)
    }

    loadData()
  }, [])

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newStatus: Task["status"] =
      task.status === "completed" ? "pending" : "completed"

    const updated = updateTask(id, { status: newStatus })
    if (updated) {
      setTasks(tasks.map((t) => (t.id === id ? updated : t)))
    }
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

  const handleSaveTask = (taskData: Omit<Task, "id"> | Task) => {
    if ("id" in taskData && taskData.id) {
      // Editing existing task
      const updated = updateTask(taskData.id, taskData)
      if (updated) {
        setTasks(tasks.map((t) => (t.id === taskData.id ? updated : t)))
      }
    } else {
      // Adding new task
      const newTask = addTask(taskData as Omit<Task, "id">)
      setTasks([...tasks, newTask])
    }
    setEditingTask(null)
    setShowAddTaskForm(false)
  }

  const handleSaveExpense = (expenseData: Omit<Expense, "id"> | Expense) => {
    if ("id" in expenseData && expenseData.id) {
      // Editing existing expense
      const updated = updateExpense(expenseData.id, expenseData)
      if (updated) {
        setExpenses(expenses.map((e) => (e.id === expenseData.id ? updated : e)))
      }
    } else {
      // Adding new expense
      const newExpense = addExpense(expenseData as Omit<Expense, "id">)
      setExpenses([...expenses, newExpense])
    }
    setEditingExpense(null)
    setShowAddExpenseForm(false)
  }

  const handleDeleteTask = (id: string) => {
    if (deleteTask(id)) {
      setTasks(tasks.filter((t) => t.id !== id))
      setExpandedTasks((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
    setDeleteConfirm(null)
  }

  const handleDeleteExpense = (id: string) => {
    if (deleteExpense(id)) {
      setExpenses(expenses.filter((e) => e.id !== id))
    }
    setDeleteConfirm(null)
  }

  const completedCount = tasks.filter((task) => task.status === "completed").length
  const totalCount = tasks.length

  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Header */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">House Prep Tracker</h1>
        <p className="text-primary-foreground/90">Track your progress getting your house ready to sell</p>
      </Card>

      <ProgressOverview
        completedCount={completedCount}
        totalCount={totalCount}
        className="mb-6"
      />

      {/* Tabs */}
      <Card className="overflow-hidden mb-0">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="w-full grid grid-cols-2 border-b-2 border-border bg-transparent p-0 h-auto rounded-none">
            <TabsTrigger 
              value="tasks"
              className="flex-1 px-6 py-4 font-semibold text-muted-foreground border-b-4 border-transparent data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="expenses"
              className="flex-1 px-6 py-4 font-semibold text-muted-foreground border-b-4 border-transparent data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none hover:bg-accent transition-colors"
            >
              Expenses
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="p-6 mt-0">
            <TasksTab
              tasks={tasks}
              expandedTasks={expandedTasks}
              onToggleTask={toggleTask}
              onToggleExpand={toggleExpanded}
              onEdit={setEditingTask}
              onDelete={(id) => setDeleteConfirm({ type: "task", id })}
              onAddClick={() => setShowAddTaskForm(true)}
            />
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="p-6 mt-0">
            <ExpensesTab
              expenses={expenses}
              onEdit={setEditingExpense}
              onDelete={(id) => setDeleteConfirm({ type: "expense", id })}
              onAddClick={() => setShowAddExpenseForm(true)}
            />
          </TabsContent>
        </Tabs>
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

      {/* Expense Form Dialog */}
      <ExpenseForm
        expense={editingExpense}
        open={showAddExpenseForm || editingExpense !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddExpenseForm(false)
            setEditingExpense(null)
          }
        }}
        onSave={handleSaveExpense}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirm !== null}
        type={deleteConfirm?.type || "task"}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            if (deleteConfirm.type === "task") {
              handleDeleteTask(deleteConfirm.id)
            } else {
              handleDeleteExpense(deleteConfirm.id)
            }
          }
        }}
      />
    </div>
  )
}
