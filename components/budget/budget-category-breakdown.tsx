"use client"

import { Card } from "@/components/ui/card"
import { Budget, Expense, ExpenseCategory } from "@/app/lib/types"
import { categoryLabels, categoryOrder, categoryColors, categoryBgColors, categoryTextColors, formatCurrency } from "./constants"
import { cn } from "@/lib/utils"

interface BudgetCategoryBreakdownProps {
  budget: Budget | null
  expenses: Expense[]
  className?: string
}

export function BudgetCategoryBreakdown({ budget, expenses, className }: BudgetCategoryBreakdownProps) {
  // Calculate spending by category
  const spendingByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0)
    return acc
  }, {} as Record<ExpenseCategory, number>)

  const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0)

  // Filter to only show categories with spending or a budget
  const relevantCategories = categoryOrder.filter(
    (category) => spendingByCategory[category] > 0 || (budget?.categoryBudgets?.[category] ?? 0) > 0
  )

  if (relevantCategories.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
        <p className="text-muted-foreground text-center py-4">
          No expenses recorded yet
        </p>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-lg font-bold mb-4">Spending by Category</h3>

      <div className="space-y-4">
        {relevantCategories.map((category) => {
          const spent = spendingByCategory[category]
          const categoryBudget = budget?.categoryBudgets?.[category]
          const percentOfTotal = totalSpent > 0 ? (spent / totalSpent) * 100 : 0
          const percentOfBudget = categoryBudget ? (spent / categoryBudget) * 100 : 0
          const isOverBudget = categoryBudget && spent > categoryBudget

          return (
            <div key={category} className={cn("p-4 rounded-xl", categoryBgColors[category])}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("font-semibold", categoryTextColors[category])}>
                  {categoryLabels[category]}
                </span>
                <div className="text-right">
                  <span className={cn("font-bold", categoryTextColors[category])}>
                    {formatCurrency(spent)}
                  </span>
                  {categoryBudget && (
                    <span className="text-xs text-muted-foreground ml-2">
                      / {formatCurrency(categoryBudget)}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isOverBudget ? "bg-red-500" : categoryColors[category]
                  )}
                  style={{
                    width: categoryBudget
                      ? `${Math.min(percentOfBudget, 100)}%`
                      : `${percentOfTotal}%`,
                  }}
                />
              </div>

              {categoryBudget && (
                <div className="mt-1 text-xs text-right">
                  {isOverBudget ? (
                    <span className="text-red-600 font-medium">
                      {formatCurrency(spent - categoryBudget)} over budget
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {formatCurrency(categoryBudget - spent)} remaining
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
