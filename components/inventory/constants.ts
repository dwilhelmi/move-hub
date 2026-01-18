import { InventoryRoom, InventoryDisposition } from "@/app/lib/types"

export const roomLabels: Record<InventoryRoom, string> = {
  kitchen: "Kitchen",
  living: "Living Room",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  garage: "Garage",
  office: "Office",
  dining: "Dining Room",
  basement: "Basement",
  attic: "Attic",
  outdoor: "Outdoor",
  other: "Other",
}

export const roomOrder: InventoryRoom[] = [
  "kitchen",
  "living",
  "dining",
  "bedroom",
  "bathroom",
  "office",
  "garage",
  "basement",
  "attic",
  "outdoor",
  "other",
]

export const dispositionLabels: Record<InventoryDisposition, string> = {
  keep: "Keep",
  sell: "Sell",
  donate: "Donate",
  trash: "Trash",
}

export const dispositionOrder: InventoryDisposition[] = [
  "keep",
  "sell",
  "donate",
  "trash",
]

export const dispositionColors: Record<InventoryDisposition, string> = {
  keep: "bg-blue-100 text-blue-700 border-blue-200",
  sell: "bg-green-100 text-green-700 border-green-200",
  donate: "bg-purple-100 text-purple-700 border-purple-200",
  trash: "bg-slate-100 text-slate-700 border-slate-200",
}

export const dispositionIconColors: Record<InventoryDisposition, string> = {
  keep: "text-blue-600",
  sell: "text-green-600",
  donate: "text-purple-600",
  trash: "text-slate-600",
}
