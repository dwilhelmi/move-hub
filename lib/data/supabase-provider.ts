/**
 * Supabase Data Provider Implementation
 *
 * This provider implements the DataProvider interface using Supabase as the backend.
 * It wraps the existing database operations from lib/supabase/database.ts.
 */

"use client"

import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { DataProvider } from "./types"
import type {
  MoveDetails,
  Task,
  Expense,
  TimelineEvent,
  InventoryItem,
  Budget,
} from "@/app/lib/types"

import {
  rowToMoveDetails,
  rowToTask,
  rowToExpense,
  rowToTimelineEvent,
  rowToInventoryItem,
  rowToBudget,
} from "@/lib/supabase/row-converters"

export class SupabaseDataProvider implements DataProvider {
  private client: SupabaseClient

  constructor(client?: SupabaseClient) {
    this.client = client || createClient()
  }

  // Move Details
  async getMoveDetails(hubId: string): Promise<MoveDetails | null> {
    const { data } = await this.client
      .from("move_details")
      .select("*")
      .eq("hub_id", hubId)
      .single()
    return rowToMoveDetails(data)
  }

  async saveMoveDetails(hubId: string, details: Partial<MoveDetails>): Promise<MoveDetails> {
    const { data: existing } = await this.client
      .from("move_details")
      .select("id")
      .eq("hub_id", hubId)
      .single()

    if (existing) {
      const { data } = await this.client
        .from("move_details")
        .update({
          current_address: details.currentAddress || null,
          new_address: details.newAddress || null,
          move_date: details.moveDate || null,
          created_date: details.createdDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq("hub_id", hubId)
        .select()
        .single()
      return rowToMoveDetails(data)!
    } else {
      const { data } = await this.client
        .from("move_details")
        .insert({
          hub_id: hubId,
          current_address: details.currentAddress || null,
          new_address: details.newAddress || null,
          move_date: details.moveDate || null,
          created_date: details.createdDate || null,
        })
        .select()
        .single()
      return rowToMoveDetails(data)!
    }
  }

  // Tasks
  async getTasks(hubId: string): Promise<Task[]> {
    const { data } = await this.client
      .from("tasks")
      .select("*")
      .eq("hub_id", hubId)
      .order("created_at", { ascending: true })
    return (data || []).map(rowToTask)
  }

  async addTask(hubId: string, task: Omit<Task, "id">): Promise<Task> {
    const { data } = await this.client
      .from("tasks")
      .insert({
        hub_id: hubId,
        title: task.title,
        description: task.description || null,
        status: task.status,
        priority: task.priority,
        category: task.category || null,
        due_date: task.dueDate || null,
        cost: task.cost || null,
      })
      .select()
      .single()
    return rowToTask(data)
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    await this.client
      .from("tasks")
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        category: updates.category,
        due_date: updates.dueDate,
        cost: updates.cost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.from("tasks").delete().eq("id", taskId)
  }

  // Expenses
  async getExpenses(hubId: string): Promise<Expense[]> {
    const { data } = await this.client
      .from("expenses")
      .select("*")
      .eq("hub_id", hubId)
      .order("date", { ascending: false })
    return (data || []).map(rowToExpense)
  }

  async addExpense(hubId: string, expense: Omit<Expense, "id">): Promise<Expense> {
    const { data } = await this.client
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
    return rowToExpense(data)
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void> {
    await this.client
      .from("expenses")
      .update({
        description: updates.description,
        amount: updates.amount,
        category: updates.category,
        date: updates.date,
        notes: updates.notes,
      })
      .eq("id", expenseId)
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await this.client.from("expenses").delete().eq("id", expenseId)
  }

  // Timeline Events
  async getTimelineEvents(hubId: string): Promise<TimelineEvent[]> {
    const { data } = await this.client
      .from("timeline_events")
      .select("*")
      .eq("hub_id", hubId)
      .order("date", { ascending: true })
    return (data || []).map(rowToTimelineEvent)
  }

  async addTimelineEvent(hubId: string, event: Omit<TimelineEvent, "id">): Promise<TimelineEvent> {
    const { data } = await this.client
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
    return rowToTimelineEvent(data)
  }

  async updateTimelineEvent(eventId: string, updates: Partial<TimelineEvent>): Promise<void> {
    await this.client
      .from("timeline_events")
      .update({
        title: updates.title,
        date: updates.date,
        type: updates.type,
        notes: updates.notes,
      })
      .eq("id", eventId)
  }

  async deleteTimelineEvent(eventId: string): Promise<void> {
    await this.client.from("timeline_events").delete().eq("id", eventId)
  }

  // Inventory Items
  async getInventoryItems(hubId: string): Promise<InventoryItem[]> {
    const { data } = await this.client
      .from("inventory_items")
      .select("*")
      .eq("hub_id", hubId)
      .order("created_at", { ascending: true })
    return (data || []).map(rowToInventoryItem)
  }

  async addInventoryItem(hubId: string, item: Omit<InventoryItem, "id">): Promise<InventoryItem> {
    const { data } = await this.client
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
    return rowToInventoryItem(data)
  }

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    await this.client
      .from("inventory_items")
      .update({
        name: updates.name,
        room: updates.room,
        disposition: updates.disposition,
        box: updates.box,
        value: updates.value,
        notes: updates.notes,
        sold: updates.sold,
        sold_amount: updates.soldAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
  }

  async deleteInventoryItem(itemId: string): Promise<void> {
    await this.client.from("inventory_items").delete().eq("id", itemId)
  }

  // Budget
  async getBudget(hubId: string): Promise<Budget | null> {
    const { data } = await this.client
      .from("budgets")
      .select("*")
      .eq("hub_id", hubId)
      .single()
    return rowToBudget(data)
  }

  async saveBudget(hubId: string, budget: Budget): Promise<Budget> {
    const { data: existing } = await this.client
      .from("budgets")
      .select("id")
      .eq("hub_id", hubId)
      .single()

    if (existing) {
      const { data } = await this.client
        .from("budgets")
        .update({
          total_budget: budget.totalBudget,
          category_budgets: budget.categoryBudgets || null,
          updated_at: new Date().toISOString(),
        })
        .eq("hub_id", hubId)
        .select()
        .single()
      return rowToBudget(data)!
    } else {
      const { data } = await this.client
        .from("budgets")
        .insert({
          hub_id: hubId,
          total_budget: budget.totalBudget,
          category_budgets: budget.categoryBudgets || null,
        })
        .select()
        .single()
      return rowToBudget(data)!
    }
  }
}
