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
import { MoveDetails } from "@/app/lib/types"

interface MoveDetailsFormProps {
  moveDetails: MoveDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (details: MoveDetails) => void
}

export function MoveDetailsForm({
  moveDetails,
  open,
  onOpenChange,
  onSave,
}: MoveDetailsFormProps) {
  const [formData, setFormData] = useState<Omit<MoveDetails, "moveDate"> & { moveDate: string }>({
    fromLocation: "",
    toLocation: "",
    moveDate: "",
  })

  useEffect(() => {
    if (moveDetails) {
      // Parse the ISO date to datetime-local format
      const dateTimeLocal = moveDetails.moveDate
        ? new Date(moveDetails.moveDate).toISOString().slice(0, 16)
        : ""
      setFormData({
        fromLocation: moveDetails.fromLocation || "",
        toLocation: moveDetails.toLocation || "",
        moveDate: dateTimeLocal,
      })
    } else {
      setFormData({
        fromLocation: "",
        toLocation: "",
        moveDate: "",
      })
    }
  }, [moveDetails, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert datetime-local to ISO string
    const moveDateISO = formData.moveDate
      ? new Date(formData.moveDate).toISOString()
      : ""

    const details: MoveDetails = {
      fromLocation: formData.fromLocation.trim(),
      toLocation: formData.toLocation.trim(),
      moveDate: moveDateISO,
      // Preserve existing createdDate when editing, or set to now for new entries
      createdDate: moveDetails?.createdDate || new Date().toISOString(),
    }

    onSave(details)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>
            {moveDetails ? "Edit Move Details" : "Set Up Your Move"}
          </DialogTitle>
          <DialogDescription>
            {moveDetails
              ? "Update your moving information"
              : "Configure your move details to get started"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fromLocation">Moving From *</Label>
              <Input
                id="fromLocation"
                value={formData.fromLocation}
                onChange={(e) =>
                  setFormData({ ...formData, fromLocation: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="toLocation">Moving To *</Label>
              <Input
                id="toLocation"
                value={formData.toLocation}
                onChange={(e) =>
                  setFormData({ ...formData, toLocation: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="moveDate">Move Date & Time *</Label>
              <Input
                id="moveDate"
                type="datetime-local"
                value={formData.moveDate}
                onChange={(e) =>
                  setFormData({ ...formData, moveDate: e.target.value })
                }
                required
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
              Save Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
