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
import { datetimeLocalToISO, isoToDatetimeLocal } from "@/lib/utils"

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
    currentAddress: "",
    newAddress: "",
    moveDate: "",
  })

  useEffect(() => {
    if (moveDetails) {
      // Parse the ISO date to datetime-local format (in local time)
      const dateTimeLocal = moveDetails.moveDate
        ? isoToDatetimeLocal(moveDetails.moveDate)
        : ""
      setFormData({
        currentAddress: moveDetails.currentAddress || "",
        newAddress: moveDetails.newAddress || "",
        moveDate: dateTimeLocal,
      })
    } else {
      setFormData({
        currentAddress: "",
        newAddress: "",
        moveDate: "",
      })
    }
  }, [moveDetails, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert datetime-local to ISO string (treating input as local time)
    const moveDateISO = formData.moveDate
      ? datetimeLocalToISO(formData.moveDate)
      : ""

    const details: MoveDetails = {
      currentAddress: formData.currentAddress?.trim(),
      newAddress: formData.newAddress?.trim(),
      moveDate: moveDateISO,
      // Preserve existing createdDate when editing, or set to now for new entries
      createdDate: moveDetails?.createdDate || new Date().toISOString(),
    }

    onSave(details)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:mx-auto">
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
              <Label htmlFor="currentAddress">Moving From *</Label>
              <Input
                id="currentAddress"
                value={formData.currentAddress}
                onChange={(e) =>
                  setFormData({ ...formData, currentAddress: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newAddress">Moving To *</Label>
              <Input
                id="newAddress"
                value={formData.newAddress}
                onChange={(e) =>
                  setFormData({ ...formData, newAddress: e.target.value })
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
