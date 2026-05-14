/**
 * LocalStorage Data Provider Implementation
 *
 * This provider implements the DataProvider interface using browser localStorage.
 * Used for guest users who aren't authenticated yet.
 */

"use client"

import type { DataProvider } from "./types"
import type {
  MoveDetails,
  Task,
  Expense,
  TimelineEvent,
  InventoryItem,
  Budget,
} from "@/app/lib/types"

/**
 * Generate storage keys scoped to a specific hub
 * This allows multiple guest hubs in the future
 */
function getStorageKey(hubId: string, entity: string): string {
  return `move-hub-${hubId}-${entity}`
}

export class LocalStorageDataProvider implements DataProvider {
  /**
   * Check if we're in a browser environment
   */
  private isClient(): boolean {
    return typeof window !== "undefined"
  }

  /**
   * Generic localStorage getter with error handling
   */
  private getFromStorage<T>(key: string, defaultValue: T): T {
    if (!this.isClient()) return defaultValue

    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  /**
   * Generic localStorage setter with error handling
   */
  private saveToStorage(key: string, value: unknown): void {
    if (!this.isClient()) return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  /**
   * Track activity for guest save prompt
   * Increments counter when guests create new items
   */
  private trackActivity(): void {
    if (!this.isClient()) return

    try {
      const key = "move-hub-guest-activity-count"
      const currentCount = localStorage.getItem(key)
      const count = currentCount ? parseInt(currentCount, 10) : 0
      localStorage.setItem(key, (count + 1).toString())
    } catch (error) {
      // Silent fail - activity tracking shouldn't break functionality
      console.error("Error tracking guest activity:", error)
    }
  }

  // Move Details
  async getMoveDetails(hubId: string): Promise<MoveDetails | null> {
    const key = getStorageKey(hubId, "move-details")
    return Promise.resolve(this.getFromStorage<MoveDetails | null>(key, null))
  }

  async saveMoveDetails(hubId: string, details: Partial<MoveDetails>): Promise<MoveDetails> {
    const key = getStorageKey(hubId, "move-details")
    const existing = this.getFromStorage<MoveDetails | null>(key, null)

    const savedDetails: MoveDetails = {
      ...existing,
      ...details,
      // Set createdDate if this is the first save
      createdDate: details.createdDate || existing?.createdDate || new Date().toISOString(),
    }

    this.saveToStorage(key, savedDetails)
    return Promise.resolve(savedDetails)
  }

  // Tasks
  async getTasks(hubId: string): Promise<Task[]> {
    const key = getStorageKey(hubId, "tasks")
    return Promise.resolve(this.getFromStorage<Task[]>(key, []))
  }

  async addTask(hubId: string, task: Omit<Task, "id">): Promise<Task> {
    const tasks = await this.getTasks(hubId)
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
    }
    const key = getStorageKey(hubId, "tasks")
    this.saveToStorage(key, [...tasks, newTask])
    this.trackActivity() // Track guest activity
    return Promise.resolve(newTask)
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    // For localStorage, we need to search across all potential hubs
    // In practice, there will only be one guest hub at a time
    // This is a simplification - we'll iterate through localStorage to find the task
    if (!this.isClient()) return Promise.resolve()

    // Find which hub contains this task
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-tasks")) {
        const tasks = this.getFromStorage<Task[]>(key, [])
        const index = tasks.findIndex((t) => t.id === taskId)
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...updates, id: taskId }
          this.saveToStorage(key, tasks)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.isClient()) return Promise.resolve()

    // Find which hub contains this task
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-tasks")) {
        const tasks = this.getFromStorage<Task[]>(key, [])
        const filtered = tasks.filter((t) => t.id !== taskId)
        if (filtered.length !== tasks.length) {
          this.saveToStorage(key, filtered)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  // Expenses
  async getExpenses(hubId: string): Promise<Expense[]> {
    const key = getStorageKey(hubId, "expenses")
    const expenses = this.getFromStorage<Expense[]>(key, [])
    // Sort by date descending (newest first) to match Supabase behavior
    return Promise.resolve(
      expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )
  }

  async addExpense(hubId: string, expense: Omit<Expense, "id">): Promise<Expense> {
    const expenses = await this.getExpenses(hubId)
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    }
    const key = getStorageKey(hubId, "expenses")
    this.saveToStorage(key, [...expenses, newExpense])
    this.trackActivity() // Track guest activity
    return Promise.resolve(newExpense)
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void> {
    if (!this.isClient()) return Promise.resolve()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-expenses")) {
        const expenses = this.getFromStorage<Expense[]>(key, [])
        const index = expenses.findIndex((e) => e.id === expenseId)
        if (index !== -1) {
          expenses[index] = { ...expenses[index], ...updates, id: expenseId }
          this.saveToStorage(key, expenses)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  async deleteExpense(expenseId: string): Promise<void> {
    if (!this.isClient()) return Promise.resolve()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-expenses")) {
        const expenses = this.getFromStorage<Expense[]>(key, [])
        const filtered = expenses.filter((e) => e.id !== expenseId)
        if (filtered.length !== expenses.length) {
          this.saveToStorage(key, filtered)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  // Timeline Events
  async getTimelineEvents(hubId: string): Promise<TimelineEvent[]> {
    const key = getStorageKey(hubId, "timeline-events")
    const events = this.getFromStorage<TimelineEvent[]>(key, [])
    // Sort by date ascending to match Supabase behavior
    return Promise.resolve(
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    )
  }

  async addTimelineEvent(hubId: string, event: Omit<TimelineEvent, "id">): Promise<TimelineEvent> {
    const events = await this.getTimelineEvents(hubId)
    const newEvent: TimelineEvent = {
      ...event,
      id: crypto.randomUUID(),
    }
    const key = getStorageKey(hubId, "timeline-events")
    this.saveToStorage(key, [...events, newEvent])
    this.trackActivity() // Track guest activity
    return Promise.resolve(newEvent)
  }

  async updateTimelineEvent(eventId: string, updates: Partial<TimelineEvent>): Promise<void> {
    if (!this.isClient()) return Promise.resolve()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-timeline-events")) {
        const events = this.getFromStorage<TimelineEvent[]>(key, [])
        const index = events.findIndex((e) => e.id === eventId)
        if (index !== -1) {
          events[index] = { ...events[index], ...updates, id: eventId }
          this.saveToStorage(key, events)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  async deleteTimelineEvent(eventId: string): Promise<void> {
    if (!this.isClient()) return Promise.resolve()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-timeline-events")) {
        const events = this.getFromStorage<TimelineEvent[]>(key, [])
        const filtered = events.filter((e) => e.id !== eventId)
        if (filtered.length !== events.length) {
          this.saveToStorage(key, filtered)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  // Inventory Items
  async getInventoryItems(hubId: string): Promise<InventoryItem[]> {
    const key = getStorageKey(hubId, "inventory-items")
    return Promise.resolve(this.getFromStorage<InventoryItem[]>(key, []))
  }

  async addInventoryItem(hubId: string, item: Omit<InventoryItem, "id">): Promise<InventoryItem> {
    const items = await this.getInventoryItems(hubId)
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
    }
    const key = getStorageKey(hubId, "inventory-items")
    this.saveToStorage(key, [...items, newItem])
    this.trackActivity() // Track guest activity
    return Promise.resolve(newItem)
  }

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    if (!this.isClient()) return Promise.resolve()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-inventory-items")) {
        const items = this.getFromStorage<InventoryItem[]>(key, [])
        const index = items.findIndex((item) => item.id === itemId)
        if (index !== -1) {
          items[index] = { ...items[index], ...updates, id: itemId }
          this.saveToStorage(key, items)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  async deleteInventoryItem(itemId: string): Promise<void> {
    if (!this.isClient()) return Promise.resolve()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes("-inventory-items")) {
        const items = this.getFromStorage<InventoryItem[]>(key, [])
        const filtered = items.filter((item) => item.id !== itemId)
        if (filtered.length !== items.length) {
          this.saveToStorage(key, filtered)
          return Promise.resolve()
        }
      }
    }
    return Promise.resolve()
  }

  // Budget
  async getBudget(hubId: string): Promise<Budget | null> {
    const key = getStorageKey(hubId, "budget")
    return Promise.resolve(this.getFromStorage<Budget | null>(key, null))
  }

  async saveBudget(hubId: string, budget: Budget): Promise<Budget> {
    const key = getStorageKey(hubId, "budget")
    this.saveToStorage(key, budget)
    return Promise.resolve(budget)
  }
}
