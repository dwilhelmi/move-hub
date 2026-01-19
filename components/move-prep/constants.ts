import { TaskCategory, ExpenseCategory } from "@/app/lib/types"

export const categoryLabels: Record<TaskCategory, string> = {
  repairs: "Repairs",
  staging: "Staging",
  cleaning: "Cleaning",
  paperwork: "Paperwork",
  photos: "Photos",
  other: "Other",
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  repairs: "Repairs",
  staging: "Staging",
  cleaning: "Cleaning",
  paperwork: "Paperwork",
  photos: "Photos",
  movers: "Movers",
  packing: "Packing Supplies",
  travel: "Travel",
  storage: "Storage",
  utilities: "Utilities",
  other: "Other",
}

export const categoryOrder: TaskCategory[] = ["repairs", "staging", "cleaning", "paperwork", "photos", "other"]

export const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

export const formatDate = (dateString?: string) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
