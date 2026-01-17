export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskCategory = "repairs" | "staging" | "cleaning" | "paperwork" | "photos"

export interface Task {
  id: string
  title: string
  description?: string
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string // ISO date string
  completedDate?: string // ISO date string
  notes?: string
  photos?: string[] // URLs or file paths
}

export type ExpenseCategory = "repairs" | "staging" | "cleaning" | "paperwork" | "photos" | "other"

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  date: string // ISO date string
  vendor?: string
}

export interface MoveDetails {
  fromLocation: string
  toLocation: string
  moveDate: string // ISO date string with time
  createdDate?: string // ISO date string - when move details were first created
}

export interface TimelineEvent {
  id: string
  title: string
  description?: string
  date: string // ISO date string
}

export type InventoryRoom = "kitchen" | "living" | "bedroom" | "bathroom" | "garage" | "office" | "other"
export type InventoryDisposition = "keep" | "sell" | "donate" | "trash"

export interface InventoryItem {
  id: string
  name: string
  room: InventoryRoom
  disposition: InventoryDisposition
  box?: string
  value?: number
  notes?: string
}
