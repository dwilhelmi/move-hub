export type TaskStatus = "pending" | "in-progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"
export type TaskCategory = "repairs" | "staging" | "cleaning" | "paperwork" | "photos" | "other"

export interface Task {
  id: string
  title: string
  description?: string
  category?: TaskCategory | string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string // ISO date string
  cost?: number
}

export type ExpenseCategory = "repairs" | "staging" | "cleaning" | "paperwork" | "photos" | "movers" | "packing" | "travel" | "storage" | "utilities" | "other"

export interface Expense {
  id: string
  category: ExpenseCategory | string
  description: string
  amount: number
  date: string // ISO date string
  notes?: string
}

export interface MoveDetails {
  currentAddress?: string
  newAddress?: string
  moveDate?: string // ISO date string with time
  createdDate?: string // ISO date string - when move details were first created
}

export interface TimelineEvent {
  id: string
  title: string
  date: string // ISO date string
  type: string
  notes?: string
  // For backwards compatibility with display
  description?: string
}

export type InventoryRoom = "kitchen" | "living" | "bedroom" | "bathroom" | "garage" | "office" | "dining" | "basement" | "attic" | "outdoor" | "other"
export type InventoryDisposition = "keep" | "sell" | "donate" | "trash"

export interface InventoryItem {
  id: string
  name: string
  room: InventoryRoom | string
  disposition: InventoryDisposition | string
  box?: string
  value?: number
  notes?: string
  sold?: boolean
  soldAmount?: number
}

export interface Budget {
  totalBudget: number
  categoryBudgets?: Partial<Record<string, number>>
}
