"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { useHub } from "@/components/providers/hub-provider"
import { HubSetup } from "@/components/hub-setup"
import {
  getBudget,
  saveBudget,
  getExpenses,
  getInventoryItems,
  Budget,
  Expense,
  InventoryItem,
} from "@/lib/supabase/database"
import { BudgetOverview } from "@/components/budget/budget-overview"
import { BudgetCategoryBreakdown } from "@/components/budget/budget-category-breakdown"
import { SellingIncome } from "@/components/budget/selling-income"
import { BudgetSettingsForm } from "@/components/budget/budget-settings-form"

export default function BudgetPage() {
  const { hub, isLoading: isHubLoading } = useHub()
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSettingsForm, setShowSettingsForm] = useState(false)

  const loadData = useCallback(async () => {
    if (!hub) return

    setIsLoading(true)
    const [storedBudget, storedExpenses, storedItems] = await Promise.all([
      getBudget(hub.id),
      getExpenses(hub.id),
      getInventoryItems(hub.id),
    ])

    setBudget(storedBudget)
    setExpenses(storedExpenses)
    setInventoryItems(storedItems)
    setIsLoading(false)
  }, [hub])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveBudget = async (newBudget: Budget) => {
    if (!hub) return
    await saveBudget(hub.id, newBudget)
    setBudget(newBudget)
    setShowSettingsForm(false)
  }

  const soldItems = inventoryItems.filter((i) => i.disposition === "sell" && i.sold)

  if (isHubLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!hub) {
    return <HubSetup />
  }

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
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Budget</h1>
        <p className="text-sm sm:text-base text-primary-foreground/90">
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
