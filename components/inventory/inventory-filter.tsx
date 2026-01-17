"use client"

import { InventoryRoom, InventoryDisposition } from "@/app/lib/types"
import { roomLabels, roomOrder, dispositionLabels, dispositionOrder } from "./constants"

type FilterType = "all" | InventoryRoom | InventoryDisposition

interface InventoryFilterProps {
  value: FilterType
  onChange: (value: FilterType) => void
}

export function InventoryFilter({ value, onChange }: InventoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        All
      </button>

      <div className="w-px bg-slate-200 mx-1" />

      {dispositionOrder.map((disposition) => (
        <button
          key={disposition}
          onClick={() => onChange(disposition)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === disposition
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {dispositionLabels[disposition]}
        </button>
      ))}

      <div className="w-px bg-slate-200 mx-1" />

      {roomOrder.map((room) => (
        <button
          key={room}
          onClick={() => onChange(room)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === room
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {roomLabels[room]}
        </button>
      ))}
    </div>
  )
}

export type { FilterType }
