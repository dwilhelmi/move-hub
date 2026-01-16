"use client"

import { Task, Expense, MoveDetails } from "./types"

const STORAGE_KEYS = {
  TASKS: "move-hub-house-prep-tasks",
  EXPENSES: "move-hub-house-prep-expenses",
  MOVE_DETAILS: "move-hub-move-details",
} as const

// Task storage functions
export function getTasks(): Task[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading tasks from localStorage:", error)
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error)
  }
}

export function addTask(task: Omit<Task, "id">): Task {
  const tasks = getTasks()
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
  }
  saveTasks([...tasks, newTask])
  return newTask
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks()
  const index = tasks.findIndex((task) => task.id === id)
  
  if (index === -1) return null
  
  const updatedTask = {
    ...tasks[index],
    ...updates,
    id, // Ensure id doesn't change
  }
  
  // If status is being updated to completed, set completedDate
  if (updates.status === "completed" && !updatedTask.completedDate) {
    updatedTask.completedDate = new Date().toISOString()
  }
  
  // If status is being changed from completed, clear completedDate
  if (updates.status && updates.status !== "completed" && updatedTask.completedDate) {
    updatedTask.completedDate = undefined
  }
  
  tasks[index] = updatedTask
  saveTasks(tasks)
  return updatedTask
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks()
  const filtered = tasks.filter((task) => task.id !== id)
  
  if (filtered.length === tasks.length) return false
  
  saveTasks(filtered)
  return true
}

// Expense storage functions
export function getExpenses(): Expense[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading expenses from localStorage:", error)
    return []
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
  } catch (error) {
    console.error("Error saving expenses to localStorage:", error)
  }
}

export function addExpense(expense: Omit<Expense, "id">): Expense {
  const expenses = getExpenses()
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
  }
  saveExpenses([...expenses, newExpense])
  return newExpense
}

export function updateExpense(id: string, updates: Partial<Expense>): Expense | null {
  const expenses = getExpenses()
  const index = expenses.findIndex((expense) => expense.id === id)
  
  if (index === -1) return null
  
  const updatedExpense = {
    ...expenses[index],
    ...updates,
    id, // Ensure id doesn't change
  }
  
  expenses[index] = updatedExpense
  saveExpenses(expenses)
  return updatedExpense
}

export function deleteExpense(id: string): boolean {
  const expenses = getExpenses()
  const filtered = expenses.filter((expense) => expense.id !== id)
  
  if (filtered.length === expenses.length) return false
  
  saveExpenses(filtered)
  return true
}

// Move details storage functions
export function getMoveDetails(): MoveDetails | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MOVE_DETAILS)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Error reading move details from localStorage:", error)
    return null
  }
}

export function saveMoveDetails(details: MoveDetails): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEYS.MOVE_DETAILS, JSON.stringify(details))
  } catch (error) {
    console.error("Error saving move details to localStorage:", error)
  }
}

// Logout function - clears all localStorage data
export function logout(): void {
  if (typeof window === "undefined") return
  
  try {
    // Clear all storage keys
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error("Error clearing localStorage:", error)
  }
}
