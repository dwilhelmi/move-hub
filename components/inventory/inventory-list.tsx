"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { InventoryItem, InventoryRoom, InventoryDisposition } from "@/app/lib/types"
import { InventoryItemCard } from "./inventory-item-card"
import { InventoryFilter, FilterType } from "./inventory-filter"
import { roomLabels, roomOrder, dispositionOrder } from "./constants"
import { Plus } from "lucide-react"

interface InventoryListProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
  onAddClick: () => void
}

export function InventoryList({ items, onEdit, onDelete, onAddClick }: InventoryListProps) {
  const [filter, setFilter] = useState<FilterType>("all")

  const filteredItems = useMemo(() => {
    if (filter === "all") return items

    // Check if filter is a disposition
    if (dispositionOrder.includes(filter as InventoryDisposition)) {
      return items.filter((item) => item.disposition === filter)
    }

    // Otherwise filter by room
    return items.filter((item) => item.room === filter)
  }, [items, filter])

  // Group filtered items by room
  const itemsByRoom = useMemo(() => {
    return roomOrder.reduce((acc, room) => {
      acc[room] = filteredItems.filter((item) => item.room === room)
      return acc
    }, {} as Record<InventoryRoom, InventoryItem[]>)
  }, [filteredItems])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
          <span className="text-sm font-semibold text-muted-foreground shrink-0">Filter:</span>
          <InventoryFilter value={filter} onChange={setFilter} />
        </div>
        <Button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 font-semibold rounded-lg shadow-lg hover:shadow-lg transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {items.length === 0
            ? "No items in your inventory yet. Add your first item to get started!"
            : "No items match the current filter."}
        </div>
      ) : (
        <div className="space-y-6">
          {roomOrder.map((room) => {
            const roomItems = itemsByRoom[room]
            if (roomItems.length === 0) return null

            return (
              <div key={room}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold">{roomLabels[room]}</h3>
                  <span className="text-sm text-muted-foreground">
                    ({roomItems.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roomItems.map((item) => (
                    <InventoryItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
