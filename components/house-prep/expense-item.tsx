"use client"

import { Button } from "@/components/ui/button"
import { Expense } from "@/app/lib/types"
import { formatDate, formatCurrency } from "./constants"
import { Edit, Trash2 } from "lucide-react"

interface ExpenseItemProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <p className="font-medium text-sm truncate">{expense.description}</p>
          {expense.vendor && (
            <span className="text-xs text-muted-foreground shrink-0">• {expense.vendor}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{formatDate(expense.date)}</p>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <p className="font-semibold text-sm sm:text-base">{formatCurrency(expense.amount)}</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(expense)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(expense.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
