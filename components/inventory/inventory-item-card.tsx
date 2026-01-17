"use client"

import { Card } from "@/components/ui/card"
import { InventoryItem } from "@/app/lib/types"
import { Edit, Trash2, Package, DollarSign, Box } from "lucide-react"
import { roomLabels, dispositionLabels, dispositionColors } from "./constants"

interface InventoryItemCardProps {
  item: InventoryItem
  onEdit: () => void
  onDelete: () => void
}

export function InventoryItemCard({ item, onEdit, onDelete }: InventoryItemCardProps) {
  return (
    <Card className="p-4 border-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
            <h3 className="font-semibold truncate">{item.name}</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${dispositionColors[item.disposition]}`}>
              {dispositionLabels[item.disposition]}
            </span>
            <span className="text-xs text-muted-foreground">
              {roomLabels[item.room]}
            </span>
            {item.box && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Box className="w-3 h-3" />
                {item.box}
              </span>
            )}
            {item.value !== undefined && item.value > 0 && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {item.value.toLocaleString()}
              </span>
            )}
          </div>

          {item.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {item.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </Card>
  )
}
