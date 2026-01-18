import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InventoryFilter, FilterType } from "@/components/inventory/inventory-filter"

describe("InventoryFilter", () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderFilter = (value: FilterType = "all") => {
    const user = userEvent.setup()
    render(<InventoryFilter value={value} onChange={mockOnChange} />)
    return { user }
  }

  describe("Rendering", () => {
    it("renders the All button", () => {
      renderFilter()
      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument()
    })

    it("renders all disposition buttons", () => {
      renderFilter()
      expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Sell" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Donate" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Trash" })).toBeInTheDocument()
    })

    it("renders all room buttons", () => {
      renderFilter()
      expect(screen.getByRole("button", { name: "Kitchen" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Living Room" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Bedroom" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Bathroom" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Garage" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Office" })).toBeInTheDocument()
    })
  })

  describe("Active State", () => {
    it("highlights All button when value is 'all'", () => {
      renderFilter("all")
      const allButton = screen.getByRole("button", { name: "All" })
      expect(allButton).toHaveClass("bg-primary")
    })

    it("highlights disposition button when disposition is selected", () => {
      renderFilter("sell")
      const sellButton = screen.getByRole("button", { name: "Sell" })
      expect(sellButton).toHaveClass("bg-primary")

      const allButton = screen.getByRole("button", { name: "All" })
      expect(allButton).not.toHaveClass("bg-primary")
    })

    it("highlights room button when room is selected", () => {
      renderFilter("kitchen")
      const kitchenButton = screen.getByRole("button", { name: "Kitchen" })
      expect(kitchenButton).toHaveClass("bg-primary")
    })
  })

  describe("Interactions", () => {
    it("calls onChange with 'all' when All button clicked", async () => {
      const { user } = renderFilter("sell")

      await user.click(screen.getByRole("button", { name: "All" }))

      expect(mockOnChange).toHaveBeenCalledWith("all")
    })

    it("calls onChange with disposition when disposition clicked", async () => {
      const { user } = renderFilter("all")

      await user.click(screen.getByRole("button", { name: "Keep" }))
      expect(mockOnChange).toHaveBeenCalledWith("keep")

      await user.click(screen.getByRole("button", { name: "Donate" }))
      expect(mockOnChange).toHaveBeenCalledWith("donate")

      await user.click(screen.getByRole("button", { name: "Trash" }))
      expect(mockOnChange).toHaveBeenCalledWith("trash")
    })

    it("calls onChange with room when room clicked", async () => {
      const { user } = renderFilter("all")

      await user.click(screen.getByRole("button", { name: "Kitchen" }))
      expect(mockOnChange).toHaveBeenCalledWith("kitchen")

      await user.click(screen.getByRole("button", { name: "Garage" }))
      expect(mockOnChange).toHaveBeenCalledWith("garage")
    })

    it("allows switching between disposition and room filters", async () => {
      const { user } = renderFilter("all")

      // Select a disposition
      await user.click(screen.getByRole("button", { name: "Sell" }))
      expect(mockOnChange).toHaveBeenLastCalledWith("sell")

      // Select a room
      await user.click(screen.getByRole("button", { name: "Bedroom" }))
      expect(mockOnChange).toHaveBeenLastCalledWith("bedroom")

      // Go back to all
      await user.click(screen.getByRole("button", { name: "All" }))
      expect(mockOnChange).toHaveBeenLastCalledWith("all")
    })
  })
})
