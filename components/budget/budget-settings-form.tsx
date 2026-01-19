"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Budget, ExpenseCategory } from "@/app/lib/types"
import { categoryLabels, categoryOrder } from "./constants"
import { ChevronDown, ChevronUp } from "lucide-react"

interface BudgetSettingsFormProps {
  budget: Budget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (budget: Budget) => void
}

export function BudgetSettingsForm({ budget, open, onOpenChange, onSave }: BudgetSettingsFormProps) {
  const [totalBudget, setTotalBudget] = useState("")
  const [showCategoryBudgets, setShowCategoryBudgets] = useState(false)
  const [categoryBudgets, setCategoryBudgets] = useState<Partial<Record<ExpenseCategory, string>>>({})

  useEffect(() => {
    if (budget) {
      setTotalBudget(budget.totalBudget.toString())
      if (budget.categoryBudgets) {
        const budgets: Partial<Record<ExpenseCategory, string>> = {}
        Object.entries(budget.categoryBudgets).forEach(([key, value]) => {
          if (value) budgets[key as ExpenseCategory] = value.toString()
        })
        setCategoryBudgets(budgets)
        setShowCategoryBudgets(Object.keys(budgets).length > 0)
      }
    } else {
      setTotalBudget("")
      setCategoryBudgets({})
      setShowCategoryBudgets(false)
    }
  }, [budget, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const total = parseInt(totalBudget)
    if (isNaN(total) || total <= 0) return

    const catBudgets: Partial<Record<ExpenseCategory, number>> = {}
    Object.entries(categoryBudgets).forEach(([key, value]) => {
      const num = parseInt(value)
      if (!isNaN(num) && num > 0) {
        catBudgets[key as ExpenseCategory] = num
      }
    })

    onSave({
      totalBudget: total,
      categoryBudgets: Object.keys(catBudgets).length > 0 ? catBudgets : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:mx-auto">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Set Budget"}</DialogTitle>
          <DialogDescription>
            Set your total moving budget and optionally set limits per category
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="totalBudget">Total Move Budget *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="totalBudget"
                  type="number"
                  min="1"
                  step="1"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="pl-7"
                  placeholder="10000"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryBudgets(!showCategoryBudgets)}
              className="flex items-center justify-between w-full p-3 bg-muted hover:bg-accent transition-colors rounded-lg"
            >
              <span className="text-sm font-medium">Category Budgets (Optional)</span>
              {showCategoryBudgets ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showCategoryBudgets && (
              <div className="grid gap-3 p-4 bg-muted rounded-lg">
                {categoryOrder.map((category) => (
                  <div key={category} className="grid grid-cols-2 gap-2 items-center">
                    <Label htmlFor={`cat-${category}`} className="text-sm">
                      {categoryLabels[category]}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        id={`cat-${category}`}
                        type="number"
                        min="0"
                        step="1"
                        value={categoryBudgets[category] || ""}
                        onChange={(e) =>
                          setCategoryBudgets({
                            ...categoryBudgets,
                            [category]: e.target.value,
                          })
                        }
                        className="pl-7 h-9"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Save Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
