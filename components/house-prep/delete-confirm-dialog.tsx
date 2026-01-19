"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteConfirmDialogProps {
  open: boolean
  type: "task" | "expense" | "event" | "item"
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const typeLabels: Record<DeleteConfirmDialogProps["type"], string> = {
  task: "Task",
  expense: "Expense",
  event: "Event",
  item: "Item",
}

export function DeleteConfirmDialog({
  open,
  type,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const typeLabel = typeLabels[type]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Delete {typeLabel}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {typeLabel.toLowerCase()}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
