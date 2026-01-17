"use client"

import { Card } from "@/components/ui/card"
import { InventoryItem } from "@/app/lib/types"
import { Package, TrendingUp, Gift, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryStatsProps {
  items: InventoryItem[]
  className?: string
}

export function InventoryStats({ items, className }: InventoryStatsProps) {
  const keepCount = items.filter((i) => i.disposition === "keep").length
  const sellCount = items.filter((i) => i.disposition === "sell").length
  const donateCount = items.filter((i) => i.disposition === "donate").length
  const trashCount = items.filter((i) => i.disposition === "trash").length

  const totalValue = items
    .filter((i) => i.disposition === "sell" && i.value)
    .reduce((sum, i) => sum + (i.value || 0), 0)

  const stats = [
    {
      label: "Keep",
      value: keepCount,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Sell",
      value: sellCount,
      subValue: totalValue > 0 ? `$${totalValue.toLocaleString()}` : undefined,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Donate",
      value: donateCount,
      icon: Gift,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Trash",
      value: trashCount,
      icon: Trash2,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
  ]

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Inventory Overview</h3>
        <span className="text-sm text-muted-foreground">
          {items.length} total items
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-xl p-4 text-center`}
            >
              <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              {stat.subValue && (
                <div className={`text-xs font-medium ${stat.color} mt-1`}>
                  {stat.subValue}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
