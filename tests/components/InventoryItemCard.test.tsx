import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { InventoryItemCard } from "@/components/inventory/inventory-item-card"
import { InventoryItem } from "@/app/lib/types"

const createItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: "item-1",
  name: "Test Item",
  room: "kitchen",
  disposition: "keep",
  ...overrides,
})

describe("InventoryItemCard", () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderCard = (item: InventoryItem = createItem()) => {
    return render(
      <InventoryItemCard item={item} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )
  }

  describe("Rendering", () => {
    it("renders item name", () => {
      renderCard(createItem({ name: "Vintage Lamp" }))
      expect(screen.getByText("Vintage Lamp")).toBeInTheDocument()
    })

    it("renders edit and delete buttons", () => {
      renderCard()
      const buttons = screen.getAllByRole("button")
      expect(buttons).toHaveLength(2)
    })
  })

  describe("Disposition Display", () => {
    it("displays Keep disposition", () => {
      renderCard(createItem({ disposition: "keep" }))
      expect(screen.getByText("Keep")).toBeInTheDocument()
    })

    it("displays Sell disposition", () => {
      renderCard(createItem({ disposition: "sell" }))
      expect(screen.getByText("Sell")).toBeInTheDocument()
    })

    it("displays Donate disposition", () => {
      renderCard(createItem({ disposition: "donate" }))
      expect(screen.getByText("Donate")).toBeInTheDocument()
    })

    it("displays Trash disposition", () => {
      renderCard(createItem({ disposition: "trash" }))
      expect(screen.getByText("Trash")).toBeInTheDocument()
    })
  })

  describe("Room Display", () => {
    it("displays Kitchen room label", () => {
      renderCard(createItem({ room: "kitchen" }))
      expect(screen.getByText("Kitchen")).toBeInTheDocument()
    })

    it("displays Living Room label", () => {
      renderCard(createItem({ room: "living" }))
      expect(screen.getByText("Living Room")).toBeInTheDocument()
    })

    it("displays Bedroom label", () => {
      renderCard(createItem({ room: "bedroom" }))
      expect(screen.getByText("Bedroom")).toBeInTheDocument()
    })

    it("displays Garage label", () => {
      renderCard(createItem({ room: "garage" }))
      expect(screen.getByText("Garage")).toBeInTheDocument()
    })
  })

  describe("Optional Fields", () => {
    it("shows box when provided", () => {
      renderCard(createItem({ box: "Box A" }))
      expect(screen.getByText("Box A")).toBeInTheDocument()
    })

    it("does not show box when not provided", () => {
      renderCard(createItem({ box: undefined }))
      expect(screen.queryByText("Box")).not.toBeInTheDocument()
    })

    it("shows value when provided and greater than zero", () => {
      renderCard(createItem({ value: 150 }))
      expect(screen.getByText("150")).toBeInTheDocument()
    })

    it("does not show value when zero", () => {
      renderCard(createItem({ value: 0 }))
      // Look for the dollar sign icon with a value
      const valueElement = screen.queryByText("0")
      // The value element should not be in the context of displaying item value
      // (there might be other zeros somewhere, but not as the item value display)
      expect(valueElement).not.toBeInTheDocument()
    })

    it("does not show value when undefined", () => {
      renderCard(createItem({ value: undefined }))
      // No dollar value should be displayed
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
    })

    it("formats large values with commas", () => {
      renderCard(createItem({ value: 2500 }))
      expect(screen.getByText("2,500")).toBeInTheDocument()
    })

    it("shows notes when provided", () => {
      renderCard(createItem({ notes: "Handle with care" }))
      expect(screen.getByText("Handle with care")).toBeInTheDocument()
    })

    it("does not show notes when not provided", () => {
      renderCard(createItem({ notes: undefined }))
      expect(screen.queryByText("Handle with care")).not.toBeInTheDocument()
    })
  })

  describe("Callbacks", () => {
    it("calls onEdit when edit button clicked", () => {
      renderCard()
      const buttons = screen.getAllByRole("button")
      fireEvent.click(buttons[0]) // First button is edit
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it("calls onDelete when delete button clicked", () => {
      renderCard()
      const buttons = screen.getAllByRole("button")
      fireEvent.click(buttons[1]) // Second button is delete
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })
  })
})
