"use client"

import { Task, Expense, MoveDetails, TimelineEvent, InventoryItem, Budget } from "./types"

const STORAGE_KEYS = {
  TASKS: "move-hub-house-prep-tasks",
  EXPENSES: "move-hub-house-prep-expenses",
  MOVE_DETAILS: "move-hub-move-details",
  TIMELINE_EVENTS: "move-hub-timeline-events",
  INVENTORY: "move-hub-inventory",
  BUDGET: "move-hub-budget",
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
    // If this is the first time saving and no createdDate exists, set it to today
    const existing = getMoveDetails()
    const detailsToSave: MoveDetails = {
      ...details,
      createdDate: details.createdDate || existing?.createdDate || new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEYS.MOVE_DETAILS, JSON.stringify(detailsToSave))
  } catch (error) {
    console.error("Error saving move details to localStorage:", error)
  }
}

// Timeline events storage functions
export function getTimelineEvents(): TimelineEvent[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIMELINE_EVENTS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading timeline events from localStorage:", error)
    return []
  }
}

export function saveTimelineEvents(events: TimelineEvent[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEYS.TIMELINE_EVENTS, JSON.stringify(events))
  } catch (error) {
    console.error("Error saving timeline events to localStorage:", error)
  }
}

export function addTimelineEvent(event: Omit<TimelineEvent, "id">): TimelineEvent {
  const events = getTimelineEvents()
  const newEvent: TimelineEvent = {
    ...event,
    id: crypto.randomUUID(),
  }
  saveTimelineEvents([...events, newEvent])
  return newEvent
}

export function updateTimelineEvent(id: string, updates: Partial<TimelineEvent>): TimelineEvent | null {
  const events = getTimelineEvents()
  const index = events.findIndex((event) => event.id === id)
  
  if (index === -1) return null
  
  const updatedEvent = {
    ...events[index],
    ...updates,
  }
  
  const updatedEvents = [...events]
  updatedEvents[index] = updatedEvent
  saveTimelineEvents(updatedEvents)
  
  return updatedEvent
}

export function deleteTimelineEvent(id: string): boolean {
  const events = getTimelineEvents()
  const filtered = events.filter((event) => event.id !== id)
  
  if (filtered.length === events.length) return false
  
  saveTimelineEvents(filtered)
  return true
}

// Inventory storage functions
export function getInventoryItems(): InventoryItem[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading inventory from localStorage:", error)
    return []
  }
}

export function saveInventoryItems(items: InventoryItem[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items))
  } catch (error) {
    console.error("Error saving inventory to localStorage:", error)
  }
}

export function addInventoryItem(item: Omit<InventoryItem, "id">): InventoryItem {
  const items = getInventoryItems()
  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
  }
  saveInventoryItems([...items, newItem])
  return newItem
}

export function updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
  const items = getInventoryItems()
  const index = items.findIndex((item) => item.id === id)

  if (index === -1) return null

  const updatedItem = {
    ...items[index],
    ...updates,
    id,
  }

  items[index] = updatedItem
  saveInventoryItems(items)
  return updatedItem
}

export function deleteInventoryItem(id: string): boolean {
  const items = getInventoryItems()
  const filtered = items.filter((item) => item.id !== id)

  if (filtered.length === items.length) return false

  saveInventoryItems(filtered)
  return true
}

// Budget storage functions
export function getBudget(): Budget | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Error reading budget from localStorage:", error)
    return null
  }
}

export function saveBudget(budget: Budget): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget))
  } catch (error) {
    console.error("Error saving budget to localStorage:", error)
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
