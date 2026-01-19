"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { useHub } from "@/components/providers/hub-provider"
import { HubSetup } from "@/components/hub-setup"
import {
  getInventoryItems,
  addInventoryItem as dbAddInventoryItem,
  updateInventoryItem as dbUpdateInventoryItem,
  deleteInventoryItem as dbDeleteInventoryItem,
  InventoryItem,
} from "@/lib/supabase/database"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryList } from "@/components/inventory/inventory-list"
import { InventoryItemForm } from "@/components/inventory-item-form"
import { DeleteConfirmDialog } from "@/components/house-prep/delete-confirm-dialog"

export default function InventoryPage() {
  const { hub, isLoading: isHubLoading } = useHub()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!hub) return

    setIsLoading(true)
    const storedItems = await getInventoryItems(hub.id)
    setItems(storedItems)
    setIsLoading(false)
  }, [hub])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveItem = async (itemData: Omit<InventoryItem, "id"> | InventoryItem) => {
    if (!hub) return

    if ("id" in itemData && itemData.id) {
      await dbUpdateInventoryItem(itemData.id, itemData)
      setItems(items.map((i) => (i.id === itemData.id ? { ...i, ...itemData } : i)))
    } else {
      const newItem = await dbAddInventoryItem(hub.id, itemData as Omit<InventoryItem, "id">)
      if (newItem) {
        setItems([...items, newItem])
      }
    }
    setEditingItem(null)
    setShowAddForm(false)
  }

  const handleDeleteItem = async (id: string) => {
    await dbDeleteInventoryItem(id)
    setItems(items.filter((i) => i.id !== id))
    setDeleteConfirm(null)
  }

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
          <div className="text-center text-muted-foreground">Loading inventory...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl md:pt-8">
      {/* Header */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Inventory</h1>
        <p className="text-sm sm:text-base text-primary-foreground/90">
          Track your belongings and decide what to keep, sell, donate, or trash
        </p>
      </Card>

      <InventoryStats items={items} className="mb-6" />

      <Card className="p-6">
        <InventoryList
          items={items}
          onEdit={setEditingItem}
          onDelete={(id) => setDeleteConfirm(id)}
          onAddClick={() => setShowAddForm(true)}
        />
      </Card>

      <InventoryItemForm
        item={editingItem}
        open={showAddForm || editingItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false)
            setEditingItem(null)
          }
        }}
        onSave={handleSaveItem}
      />

      <DeleteConfirmDialog
        open={deleteConfirm !== null}
        type="item"
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteItem(deleteConfirm)
          }
        }}
      />
    </div>
  )
}
