"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Budget, Expense, InventoryItem } from "@/app/lib/types"
import {
  getBudget,
  saveBudget,
  getExpenses,
  getInventoryItems,
} from "@/app/lib/storage"
import { BudgetOverview } from "@/components/budget/budget-overview"
import { BudgetCategoryBreakdown } from "@/components/budget/budget-category-breakdown"
import { SellingIncome } from "@/components/budget/selling-income"
import { BudgetSettingsForm } from "@/components/budget/budget-settings-form"

export default function BudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSettingsForm, setShowSettingsForm] = useState(false)

  useEffect(() => {
    const loadData = () => {
      const storedBudget = getBudget()
      const storedExpenses = getExpenses()
      const storedItems = getInventoryItems()
      setBudget(storedBudget)
      setExpenses(storedExpenses)
      setInventoryItems(storedItems)
      setIsLoading(false)
    }

    loadData()

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "move-hub-budget" ||
        e.key === "move-hub-house-prep-expenses" ||
        e.key === "move-hub-inventory"
      ) {
        loadData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleSaveBudget = (newBudget: Budget) => {
    saveBudget(newBudget)
    setBudget(newBudget)
    setShowSettingsForm(false)
  }

  const soldItems = inventoryItems.filter((i) => i.disposition === "sell" && i.sold)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
        <Card className="p-12">
          <div className="text-center text-muted-foreground">Loading budget...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Header */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Budget</h1>
        <p className="text-primary-foreground/90">
          Track your moving expenses and income from sales
        </p>
      </Card>

      <div className="space-y-6">
        <BudgetOverview
          budget={budget}
          expenses={expenses}
          soldItems={soldItems}
          onEditBudget={() => setShowSettingsForm(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetCategoryBreakdown budget={budget} expenses={expenses} />
          <SellingIncome items={inventoryItems} />
        </div>
      </div>

      <BudgetSettingsForm
        budget={budget}
        open={showSettingsForm}
        onOpenChange={setShowSettingsForm}
        onSave={handleSaveBudget}
      />
    </div>
  )
}
