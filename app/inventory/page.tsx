"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { InventoryItem } from "@/app/lib/types"
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/app/lib/storage"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryList } from "@/components/inventory/inventory-list"
import { InventoryItemForm } from "@/components/inventory-item-form"
import { DeleteConfirmDialog } from "@/components/house-prep/delete-confirm-dialog"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const loadData = () => {
      const storedItems = getInventoryItems()
      setItems(storedItems)
      setIsLoading(false)
    }

    loadData()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "move-hub-inventory") {
        loadData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleSaveItem = (itemData: Omit<InventoryItem, "id"> | InventoryItem) => {
    if ("id" in itemData && itemData.id) {
      const updated = updateInventoryItem(itemData.id, itemData)
      if (updated) {
        setItems(items.map((i) => (i.id === itemData.id ? updated : i)))
      }
    } else {
      const newItem = addInventoryItem(itemData as Omit<InventoryItem, "id">)
      setItems([...items, newItem])
    }
    setEditingItem(null)
    setShowAddForm(false)
  }

  const handleDeleteItem = (id: string) => {
    if (deleteInventoryItem(id)) {
      setItems(items.filter((i) => i.id !== id))
    }
    setDeleteConfirm(null)
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
      <Card className="mb-6 bg-primary text-primary-foreground border-0 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Inventory</h1>
        <p className="text-primary-foreground/90">
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
