"use client"

import { Card } from "@/components/ui/card"
import { Budget, Expense, Task, ExpenseCategory } from "@/app/lib/types"
import { categoryLabels, categoryOrder, categoryColors, categoryBgColors, categoryTextColors, formatCurrency } from "./constants"
import { cn } from "@/lib/utils"

interface BudgetCategoryBreakdownProps {
  budget: Budget | null
  expenses: Expense[]
  tasks: Task[]
  className?: string
}

export function BudgetCategoryBreakdown({ budget, expenses, tasks, className }: BudgetCategoryBreakdownProps) {
  // Calculate spending by category (combining expenses and completed task costs)
  const spendingByCategory = categoryOrder.reduce((acc, category) => {
    const expenseTotal = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0)
    const completedTaskCostTotal = tasks
      .filter((t) => t.category === category && t.status === "completed")
      .reduce((sum, t) => sum + (t.cost || 0), 0)
    acc[category] = expenseTotal + completedTaskCostTotal
    return acc
  }, {} as Record<ExpenseCategory, number>)

  // Calculate pending costs by category
  const pendingByCategory = categoryOrder.reduce((acc, category) => {
    const pendingTaskCostTotal = tasks
      .filter((t) => t.category === category && t.status !== "completed")
      .reduce((sum, t) => sum + (t.cost || 0), 0)
    acc[category] = pendingTaskCostTotal
    return acc
  }, {} as Record<ExpenseCategory, number>)

  const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0)
  const totalPending = Object.values(pendingByCategory).reduce((sum, amount) => sum + amount, 0)
  const totalProjected = totalSpent + totalPending

  // Filter to only show categories with spending, pending costs, or a budget
  const relevantCategories = categoryOrder.filter(
    (category) =>
      spendingByCategory[category] > 0 ||
      pendingByCategory[category] > 0 ||
      (budget?.categoryBudgets?.[category] ?? 0) > 0
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
          const pending = pendingByCategory[category]
          const projected = spent + pending
          const categoryBudget = budget?.categoryBudgets?.[category]
          const percentOfTotal = totalProjected > 0 ? (projected / totalProjected) * 100 : 0
          const spentPercentOfBudget = categoryBudget ? (spent / categoryBudget) * 100 : 0
          const projectedPercentOfBudget = categoryBudget ? (projected / categoryBudget) * 100 : 0
          const isOverBudget = categoryBudget && projected > categoryBudget

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
                  {pending > 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">
                      +{formatCurrency(pending)}
                    </span>
                  )}
                  {categoryBudget && (
                    <span className="text-xs text-muted-foreground ml-2">
                      / {formatCurrency(categoryBudget)}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar with spent and pending sections */}
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div className="h-full flex">
                  {/* Spent portion */}
                  <div
                    className={cn(
                      "h-full transition-all",
                      isOverBudget ? "bg-red-500" : categoryColors[category]
                    )}
                    style={{
                      width: categoryBudget
                        ? `${Math.min(spentPercentOfBudget, 100)}%`
                        : `${spent > 0 && totalProjected > 0 ? (spent / totalProjected) * 100 : 0}%`,
                    }}
                  />
                  {/* Pending portion */}
                  {pending > 0 && (
                    <div
                      className="h-full bg-amber-400 dark:bg-amber-500 transition-all"
                      style={{
                        width: categoryBudget
                          ? `${Math.min(Math.max(projectedPercentOfBudget - spentPercentOfBudget, 0), 100 - spentPercentOfBudget)}%`
                          : `${totalProjected > 0 ? (pending / totalProjected) * 100 : 0}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {categoryBudget && (
                <div className="mt-1 text-xs text-right">
                  {isOverBudget ? (
                    <span className="text-red-600 font-medium">
                      {formatCurrency(projected - categoryBudget)} over budget
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {formatCurrency(categoryBudget - projected)} remaining
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
