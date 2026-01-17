"use client"

import { Card } from "@/components/ui/card"
import { InventoryItem } from "@/app/lib/types"
import { formatCurrency } from "./constants"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, DollarSign } from "lucide-react"
import Link from "next/link"

interface SellingIncomeProps {
  items: InventoryItem[]
  className?: string
}

export function SellingIncome({ items, className }: SellingIncomeProps) {
  const sellItems = items.filter((i) => i.disposition === "sell")
  const soldItems = sellItems.filter((i) => i.sold)
  const unsoldItems = sellItems.filter((i) => !i.sold)

  const potentialIncome = sellItems.reduce((sum, i) => sum + (i.value || 0), 0)
  const actualIncome = soldItems.reduce((sum, i) => sum + (i.soldAmount || i.value || 0), 0)
  const pendingIncome = unsoldItems.reduce((sum, i) => sum + (i.value || 0), 0)

  if (sellItems.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <h3 className="text-lg font-bold mb-4">Income from Sales</h3>
        <p className="text-muted-foreground text-center py-4">
          No items marked for sale.{" "}
          <Link href="/inventory" className="text-primary hover:underline">
            Add items to inventory
          </Link>
        </p>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Income from Sales</h3>
        <Link href="/inventory" className="text-sm text-primary hover:underline">
          Manage Inventory
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-xl text-center">
          <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{formatCurrency(actualIncome)}</div>
          <div className="text-xs text-muted-foreground">Sold ({soldItems.length} items)</div>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl text-center">
          <Circle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingIncome)}</div>
          <div className="text-xs text-muted-foreground">Pending ({unsoldItems.length} items)</div>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sellItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              item.sold ? "bg-green-50" : "bg-slate-50"
            )}
          >
            <div className="flex items-center gap-3">
              {item.sold ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-slate-400" />
              )}
              <span className={cn("font-medium", item.sold && "text-green-700")}>
                {item.name}
              </span>
            </div>
            <div className="text-right">
              {item.sold && item.soldAmount ? (
                <div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(item.soldAmount)}
                  </span>
                  {item.value && item.soldAmount !== item.value && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (est. {formatCurrency(item.value)})
                    </span>
                  )}
                </div>
              ) : (
                <span className={cn(item.sold ? "text-green-600" : "text-muted-foreground")}>
                  {item.value ? formatCurrency(item.value) : "No estimate"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
