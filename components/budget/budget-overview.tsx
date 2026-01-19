"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Budget, Expense, InventoryItem } from "@/app/lib/types"
import { Settings, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { formatCurrency } from "./constants"
import { cn } from "@/lib/utils"

interface BudgetOverviewProps {
  budget: Budget | null
  expenses: Expense[]
  soldItems: InventoryItem[]
  onEditBudget: () => void
  className?: string
}

export function BudgetOverview({
  budget,
  expenses,
  soldItems,
  onEditBudget,
  className,
}: BudgetOverviewProps) {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = soldItems.reduce((sum, i) => sum + (i.soldAmount || 0), 0)
  const netCost = totalSpent - totalIncome

  if (!budget) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Set Your Move Budget</h3>
        <p className="text-muted-foreground mb-4">
          Create a budget to track your moving expenses and stay on target
        </p>
        <Button onClick={onEditBudget}>Set Budget</Button>
      </Card>
    )
  }

  const remaining = budget.totalBudget - netCost
  const percentUsed = Math.min((netCost / budget.totalBudget) * 100, 100)
  const isOverBudget = netCost > budget.totalBudget

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Budget Overview</h3>
        <Button variant="ghost" size="sm" onClick={onEditBudget}>
          <Settings className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(netCost)} of {formatCurrency(budget.totalBudget)}
          </span>
          <span className={cn("text-sm font-medium", isOverBudget ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")}>
            {isOverBudget ? "Over budget!" : `${formatCurrency(remaining)} remaining`}
          </span>
        </div>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOverBudget ? "bg-red-500" : percentUsed > 75 ? "bg-amber-500" : "bg-green-500"
            )}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
          <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalSpent)}</div>
          <div className="text-xs text-muted-foreground">Total Spent</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</div>
          <div className="text-xs text-muted-foreground">From Sales</div>
        </div>
        <div className={cn("text-center p-4 rounded-xl", isOverBudget ? "bg-red-50 dark:bg-red-950/30" : "bg-blue-50 dark:bg-blue-950/30")}>
          <Wallet className={cn("w-6 h-6 mx-auto mb-2", isOverBudget ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400")} />
          <div className={cn("text-lg sm:text-xl font-bold", isOverBudget ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400")}>
            {formatCurrency(netCost)}
          </div>
          <div className="text-xs text-muted-foreground">Net Cost</div>
        </div>
      </div>
    </Card>
  )
}
