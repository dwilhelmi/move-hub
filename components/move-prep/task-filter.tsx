"use client"

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
    <Select value={value} onValueChange={(value) => onChange(value as FilterType)}>
      <SelectTrigger className="px-4 py-2 bg-secondary border-2 border-border rounded-lg font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-[200px]">
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
  )
}
