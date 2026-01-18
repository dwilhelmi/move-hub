import { ExpenseCategory } from "@/app/lib/types"

export const categoryLabels: Record<ExpenseCategory, string> = {
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

export const categoryOrder: ExpenseCategory[] = [
  "movers",
  "packing",
  "repairs",
  "staging",
  "cleaning",
  "travel",
  "storage",
  "utilities",
  "paperwork",
  "photos",
  "other",
]

export const categoryColors: Record<ExpenseCategory, string> = {
  repairs: "bg-red-500",
  staging: "bg-purple-500",
  cleaning: "bg-blue-500",
  paperwork: "bg-amber-500",
  photos: "bg-green-500",
  movers: "bg-orange-500",
  packing: "bg-cyan-500",
  travel: "bg-indigo-500",
  storage: "bg-teal-500",
  utilities: "bg-yellow-500",
  other: "bg-slate-500",
}

export const categoryBgColors: Record<ExpenseCategory, string> = {
  repairs: "bg-red-50",
  staging: "bg-purple-50",
  cleaning: "bg-blue-50",
  paperwork: "bg-amber-50",
  photos: "bg-green-50",
  movers: "bg-orange-50",
  packing: "bg-cyan-50",
  travel: "bg-indigo-50",
  storage: "bg-teal-50",
  utilities: "bg-yellow-50",
  other: "bg-slate-50",
}

export const categoryTextColors: Record<ExpenseCategory, string> = {
  repairs: "text-red-700",
  staging: "text-purple-700",
  cleaning: "text-blue-700",
  paperwork: "text-amber-700",
  photos: "text-green-700",
  movers: "text-orange-700",
  packing: "text-cyan-700",
  travel: "text-indigo-700",
  storage: "text-teal-700",
  utilities: "text-yellow-700",
  other: "text-slate-700",
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
