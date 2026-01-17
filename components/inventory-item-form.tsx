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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InventoryItem, InventoryRoom, InventoryDisposition } from "@/app/lib/types"
import { roomLabels, roomOrder, dispositionLabels, dispositionOrder } from "@/components/inventory/constants"

interface InventoryItemFormProps {
  item?: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<InventoryItem, "id"> | InventoryItem) => void
}

export function InventoryItemForm({ item, open, onOpenChange, onSave }: InventoryItemFormProps) {
  const [formData, setFormData] = useState<Omit<InventoryItem, "id">>({
    name: "",
    room: "living",
    disposition: "keep",
    box: "",
    value: undefined,
    notes: "",
    sold: false,
    soldAmount: undefined,
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        room: item.room,
        disposition: item.disposition,
        box: item.box || "",
        value: item.value,
        notes: item.notes || "",
        sold: item.sold || false,
        soldAmount: item.soldAmount,
      })
    } else {
      setFormData({
        name: "",
        room: "living",
        disposition: "keep",
        box: "",
        value: undefined,
        notes: "",
        sold: false,
        soldAmount: undefined,
      })
    }
  }, [item, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const itemData: Omit<InventoryItem, "id"> = {
      name: formData.name.trim(),
      room: formData.room,
      disposition: formData.disposition,
      box: formData.box?.trim() || undefined,
      value: formData.value || undefined,
      notes: formData.notes?.trim() || undefined,
      sold: formData.disposition === "sell" ? formData.sold : undefined,
      soldAmount: formData.disposition === "sell" && formData.sold ? formData.soldAmount : undefined,
    }

    if (item) {
      onSave({ ...itemData, id: item.id })
    } else {
      onSave(itemData)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update item details" : "Add a new item to your inventory"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Couch, Kitchen Table, TV"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="room">Room</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value: InventoryRoom) =>
                    setFormData({ ...formData, room: value })
                  }
                >
                  <SelectTrigger id="room">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOrder.map((room) => (
                      <SelectItem key={room} value={room}>
                        {roomLabels[room]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="disposition">What to do</Label>
                <Select
                  value={formData.disposition}
                  onValueChange={(value: InventoryDisposition) =>
                    setFormData({ ...formData, disposition: value })
                  }
                >
                  <SelectTrigger id="disposition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dispositionOrder.map((disposition) => (
                      <SelectItem key={disposition} value={disposition}>
                        {dispositionLabels[disposition]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="box">Box/Container</Label>
                <Input
                  id="box"
                  value={formData.box}
                  onChange={(e) => setFormData({ ...formData, box: e.target.value })}
                  placeholder="e.g., Box #1, Kitchen Box A"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="value">Estimated Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.value || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="For items to sell"
                />
              </div>
            </div>

            {formData.disposition === "sell" && (
              <div className="p-4 bg-green-50 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sold"
                    checked={formData.sold || false}
                    onChange={(e) =>
                      setFormData({ ...formData, sold: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="sold" className="text-green-700 font-medium cursor-pointer">
                    Item has been sold
                  </Label>
                </div>

                {formData.sold && (
                  <div className="grid gap-2">
                    <Label htmlFor="soldAmount">Actual Sale Amount ($)</Label>
                    <Input
                      id="soldAmount"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.soldAmount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          soldAmount: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder={formData.value ? `Estimated: ${formData.value}` : "Enter sale amount"}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
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
              Save Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
