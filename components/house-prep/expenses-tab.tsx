"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Expense, ExpenseCategory } from "@/app/lib/types"
import { ExpenseItem } from "./expense-item"
import { expenseCategoryLabels, formatCurrency } from "./constants"
import { Plus, DollarSign } from "lucide-react"

interface ExpensesTabProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  onAddClick: () => void
}

export function ExpensesTab({
  expenses,
  onEdit,
  onDelete,
  onAddClick,
}: ExpensesTabProps) {
  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const categories: ExpenseCategory[] = [
      "repairs",
      "staging",
      "cleaning",
      "paperwork",
      "photos",
      "other",
    ]
    return categories.reduce((acc, category) => {
      acc[category] = expenses.filter((expense) => expense.category === category)
      return acc
    }, {} as Record<ExpenseCategory, Expense[]>)
  }, [expenses])

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Expenses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Total: <span className="font-semibold text-foreground">{formatCurrency(totalExpenses)}</span>
          </p>
        </div>
        <Button onClick={onAddClick} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Expenses by Category */}
      <div className="space-y-6">
        {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
          if (categoryExpenses.length === 0) return null

          const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {expenseCategoryLabels[category as ExpenseCategory]}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {categoryExpenses.length}{" "}
                    {categoryExpenses.length === 1 ? "expense" : "expenses"} •{" "}
                    {formatCurrency(categoryTotal)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryExpenses.map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {expenses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No expenses yet. Add your first expense to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
