"use client"

import { createClient } from "./client"
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

// Import row converters from separate file (also used in tests)
import {
  rowToMoveDetails,
  rowToTask,
  rowToExpense,
  rowToTimelineEvent,
  rowToInventoryItem,
  rowToBudget,
} from "./row-converters"

// Database operations
export async function getMoveDetails(hubId: string): Promise<MoveDetails | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("move_details")
    .select("*")
    .eq("hub_id", hubId)
    .single()
  return rowToMoveDetails(data)
}

export async function saveMoveDetails(hubId: string, details: MoveDetails): Promise<void> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("move_details")
    .select("id")
    .eq("hub_id", hubId)
    .single()

  if (existing) {
    await supabase
      .from("move_details")
      .update({
        current_address: details.currentAddress || null,
        new_address: details.newAddress || null,
        move_date: details.moveDate || null,
        created_date: details.createdDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("hub_id", hubId)
  } else {
    await supabase.from("move_details").insert({
      hub_id: hubId,
      current_address: details.currentAddress || null,
      new_address: details.newAddress || null,
      move_date: details.moveDate || null,
      created_date: details.createdDate || null,
    })
  }
}

// Tasks
export async function getTasks(hubId: string): Promise<Task[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("hub_id", hubId)
    .order("created_at", { ascending: true })
  return (data || []).map(rowToTask)
}

export async function addTask(hubId: string, task: Omit<Task, "id">): Promise<Task | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("tasks")
    .insert({
      hub_id: hubId,
      title: task.title,
      description: task.description || null,
      status: task.status,
      priority: task.priority,
      category: task.category || null,
      due_date: task.dueDate || null,
    })
    .select()
    .single()
  return data ? rowToTask(data) : null
}

export async function updateTask(taskId: string, task: Partial<Task>): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("tasks")
    .update({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.dueDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("tasks").delete().eq("id", taskId)
}

// Expenses
export async function getExpenses(hubId: string): Promise<Expense[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("hub_id", hubId)
    .order("date", { ascending: false })
  return (data || []).map(rowToExpense)
}

export async function addExpense(hubId: string, expense: Omit<Expense, "id">): Promise<Expense | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("expenses")
    .insert({
      hub_id: hubId,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || null,
    })
    .select()
    .single()
  return data ? rowToExpense(data) : null
}

export async function updateExpense(expenseId: string, expense: Partial<Expense>): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("expenses")
    .update({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes,
    })
    .eq("id", expenseId)
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("expenses").delete().eq("id", expenseId)
}

// Timeline Events
export async function getTimelineEvents(hubId: string): Promise<TimelineEvent[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("hub_id", hubId)
    .order("date", { ascending: true })
  return (data || []).map(rowToTimelineEvent)
}

export async function addTimelineEvent(
  hubId: string,
  event: Omit<TimelineEvent, "id">
): Promise<TimelineEvent | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("timeline_events")
    .insert({
      hub_id: hubId,
      title: event.title,
      date: event.date,
      type: event.type,
      notes: event.notes || null,
    })
    .select()
    .single()
  return data ? rowToTimelineEvent(data) : null
}

export async function updateTimelineEvent(
  eventId: string,
  event: Partial<TimelineEvent>
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("timeline_events")
    .update({
      title: event.title,
      date: event.date,
      type: event.type,
      notes: event.notes,
    })
    .eq("id", eventId)
}

export async function deleteTimelineEvent(eventId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("timeline_events").delete().eq("id", eventId)
}

// Inventory Items
export async function getInventoryItems(hubId: string): Promise<InventoryItem[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("hub_id", hubId)
    .order("created_at", { ascending: true })
  return (data || []).map(rowToInventoryItem)
}

export async function addInventoryItem(
  hubId: string,
  item: Omit<InventoryItem, "id">
): Promise<InventoryItem | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("inventory_items")
    .insert({
      hub_id: hubId,
      name: item.name,
      room: item.room,
      disposition: item.disposition,
      box: item.box || null,
      value: item.value || null,
      notes: item.notes || null,
      sold: item.sold || false,
      sold_amount: item.soldAmount || null,
    })
    .select()
    .single()
  return data ? rowToInventoryItem(data) : null
}

export async function updateInventoryItem(
  itemId: string,
  item: Partial<InventoryItem>
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("inventory_items")
    .update({
      name: item.name,
      room: item.room,
      disposition: item.disposition,
      box: item.box,
      value: item.value,
      notes: item.notes,
      sold: item.sold,
      sold_amount: item.soldAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("inventory_items").delete().eq("id", itemId)
}

// Budget
export async function getBudget(hubId: string): Promise<Budget | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("hub_id", hubId)
    .single()
  return rowToBudget(data)
}

export async function saveBudget(hubId: string, budget: Budget): Promise<void> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("hub_id", hubId)
    .single()

  if (existing) {
    await supabase
      .from("budgets")
      .update({
        total_budget: budget.totalBudget,
        category_budgets: budget.categoryBudgets || null,
        updated_at: new Date().toISOString(),
      })
      .eq("hub_id", hubId)
  } else {
    await supabase.from("budgets").insert({
      hub_id: hubId,
      total_budget: budget.totalBudget,
      category_budgets: budget.categoryBudgets || null,
    })
  }
}
