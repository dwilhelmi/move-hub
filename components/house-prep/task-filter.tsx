"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskCategory, TaskStatus } from "@/app/lib/types"

type FilterType = "all" | TaskCategory | TaskStatus

interface TaskFilterProps {
  value: FilterType
  onChange: (value: FilterType) => void
}

export function TaskFilter({ value, onChange }: TaskFilterProps) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium shrink-0">Filter:</Label>
          <Select value={value} onValueChange={(value) => onChange(value as FilterType)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Status: Pending</SelectItem>
              <SelectItem value="in-progress">Status: In Progress</SelectItem>
              <SelectItem value="completed">Status: Completed</SelectItem>
              <SelectItem value="cancelled">Status: Cancelled</SelectItem>
              <SelectItem value="repairs">Category: Repairs</SelectItem>
              <SelectItem value="staging">Category: Staging</SelectItem>
              <SelectItem value="cleaning">Category: Cleaning</SelectItem>
              <SelectItem value="paperwork">Category: Paperwork</SelectItem>
              <SelectItem value="photos">Category: Photos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
