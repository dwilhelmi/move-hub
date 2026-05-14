"use client"

import { SupabaseDataProvider } from "@/lib/data/supabase-provider"

// Re-export types from the main types file for consistency
export type {
  MoveDetails,
  Task,
  Expense,
  TimelineEvent,
  InventoryItem,
  Budget,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  ExpenseCategory,
  InventoryRoom,
  InventoryDisposition,
} from "@/app/lib/types"

import type {
  MoveDetails,
  Task,
  Expense,
  TimelineEvent,
  InventoryItem,
  Budget,
} from "@/app/lib/types"

/**
 * Backward Compatibility Layer
 *
 * This file now delegates all operations to SupabaseDataProvider.
 * This allows existing code to continue working while we gradually migrate to useDataProvider().
 *
 * NEW CODE SHOULD USE useDataProvider() HOOK INSTEAD OF THESE FUNCTIONS.
 */

// Create a singleton provider instance for backward compatibility
const defaultProvider = new SupabaseDataProvider()

// Move Details
export async function getMoveDetails(hubId: string): Promise<MoveDetails | null> {
  return defaultProvider.getMoveDetails(hubId)
}

export async function saveMoveDetails(hubId: string, details: MoveDetails): Promise<void> {
  await defaultProvider.saveMoveDetails(hubId, details)
}

// Tasks
export async function getTasks(hubId: string): Promise<Task[]> {
  return defaultProvider.getTasks(hubId)
}

export async function addTask(hubId: string, task: Omit<Task, "id">): Promise<Task | null> {
  return defaultProvider.addTask(hubId, task)
}

export async function updateTask(taskId: string, task: Partial<Task>): Promise<void> {
  return defaultProvider.updateTask(taskId, task)
}

export async function deleteTask(taskId: string): Promise<void> {
  return defaultProvider.deleteTask(taskId)
}

// Expenses
export async function getExpenses(hubId: string): Promise<Expense[]> {
  return defaultProvider.getExpenses(hubId)
}

export async function addExpense(hubId: string, expense: Omit<Expense, "id">): Promise<Expense | null> {
  return defaultProvider.addExpense(hubId, expense)
}

export async function updateExpense(expenseId: string, expense: Partial<Expense>): Promise<void> {
  return defaultProvider.updateExpense(expenseId, expense)
}

export async function deleteExpense(expenseId: string): Promise<void> {
  return defaultProvider.deleteExpense(expenseId)
}

// Timeline Events
export async function getTimelineEvents(hubId: string): Promise<TimelineEvent[]> {
  return defaultProvider.getTimelineEvents(hubId)
}

export async function addTimelineEvent(
  hubId: string,
  event: Omit<TimelineEvent, "id">
): Promise<TimelineEvent | null> {
  return defaultProvider.addTimelineEvent(hubId, event)
}

export async function updateTimelineEvent(
  eventId: string,
  event: Partial<TimelineEvent>
): Promise<void> {
  return defaultProvider.updateTimelineEvent(eventId, event)
}

export async function deleteTimelineEvent(eventId: string): Promise<void> {
  return defaultProvider.deleteTimelineEvent(eventId)
}

// Inventory Items
export async function getInventoryItems(hubId: string): Promise<InventoryItem[]> {
  return defaultProvider.getInventoryItems(hubId)
}

export async function addInventoryItem(
  hubId: string,
  item: Omit<InventoryItem, "id">
): Promise<InventoryItem | null> {
  return defaultProvider.addInventoryItem(hubId, item)
}

export async function updateInventoryItem(
  itemId: string,
  item: Partial<InventoryItem>
): Promise<void> {
  return defaultProvider.updateInventoryItem(itemId, item)
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  return defaultProvider.deleteInventoryItem(itemId)
}

// Budget
export async function getBudget(hubId: string): Promise<Budget | null> {
  return defaultProvider.getBudget(hubId)
}

export async function saveBudget(hubId: string, budget: Budget): Promise<void> {
  await defaultProvider.saveBudget(hubId, budget)
}
