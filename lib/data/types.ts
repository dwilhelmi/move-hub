/**
 * Data Provider Abstraction Layer Types
 *
 * This file defines the storage-agnostic interface for data operations.
 * Implementations can use Supabase, localStorage, or any other storage backend.
 */

import type {
  MoveDetails,
  Task,
  Expense,
  TimelineEvent,
  InventoryItem,
  Budget,
} from "@/app/lib/types"

/**
 * Storage mode determines which provider implementation to use
 * - 'database': Use Supabase for authenticated users
 * - 'local': Use localStorage for guest users
 */
export type StorageMode = "database" | "local"

/**
 * DataProvider interface defines all CRUD operations for the app's entities.
 * Both SupabaseDataProvider and LocalStorageDataProvider implement this interface.
 */
export interface DataProvider {
  // Move Details (singleton per hub)
  getMoveDetails(hubId: string): Promise<MoveDetails | null>
  saveMoveDetails(hubId: string, details: Partial<MoveDetails>): Promise<MoveDetails>

  // Tasks
  getTasks(hubId: string): Promise<Task[]>
  addTask(hubId: string, task: Omit<Task, "id">): Promise<Task>
  updateTask(taskId: string, updates: Partial<Task>): Promise<void>
  deleteTask(taskId: string): Promise<void>

  // Expenses
  getExpenses(hubId: string): Promise<Expense[]>
  addExpense(hubId: string, expense: Omit<Expense, "id">): Promise<Expense>
  updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void>
  deleteExpense(expenseId: string): Promise<void>

  // Timeline Events
  getTimelineEvents(hubId: string): Promise<TimelineEvent[]>
  addTimelineEvent(hubId: string, event: Omit<TimelineEvent, "id">): Promise<TimelineEvent>
  updateTimelineEvent(eventId: string, updates: Partial<TimelineEvent>): Promise<void>
  deleteTimelineEvent(eventId: string): Promise<void>

  // Inventory Items
  getInventoryItems(hubId: string): Promise<InventoryItem[]>
  addInventoryItem(hubId: string, item: Omit<InventoryItem, "id">): Promise<InventoryItem>
  updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void>
  deleteInventoryItem(itemId: string): Promise<void>

  // Budget (singleton per hub)
  getBudget(hubId: string): Promise<Budget | null>
  saveBudget(hubId: string, budget: Budget): Promise<Budget>
}
