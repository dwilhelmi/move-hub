import type {
  MoveDetailsRow,
  TaskRow,
  ExpenseRow,
  TimelineEventRow,
  InventoryItemRow,
  BudgetRow,
} from "./types"

import type {
  MoveDetails,
  Task,
  Expense,
  TimelineEvent,
  InventoryItem,
  Budget,
} from "@/app/lib/types"

// Helper functions to convert database rows to app types
// These are exported for testing

export function rowToMoveDetails(row: MoveDetailsRow | null): MoveDetails | null {
  if (!row) return null
  return {
    currentAddress: row.current_address || undefined,
    newAddress: row.new_address || undefined,
    moveDate: row.move_date || undefined,
    createdDate: row.created_date || undefined,
  }
}

export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    status: row.status,
    priority: row.priority,
    category: row.category || undefined,
    dueDate: row.due_date || undefined,
  }
}

export function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    category: row.category,
    date: row.date,
    notes: row.notes || undefined,
  }
}

export function rowToTimelineEvent(row: TimelineEventRow): TimelineEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    type: row.type,
    notes: row.notes || undefined,
  }
}

export function rowToInventoryItem(row: InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    room: row.room,
    disposition: row.disposition,
    box: row.box || undefined,
    value: row.value || undefined,
    notes: row.notes || undefined,
    sold: row.sold || undefined,
    soldAmount: row.sold_amount || undefined,
  }
}

export function rowToBudget(row: BudgetRow | null): Budget | null {
  if (!row) return null
  return {
    totalBudget: row.total_budget,
    categoryBudgets: row.category_budgets as Record<string, number> | undefined,
  }
}
