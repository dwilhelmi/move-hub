import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryItem } from "@/app/lib/types"

const createItem = (
  overrides: Partial<InventoryItem> = {}
): InventoryItem => ({
  id: Math.random().toString(),
  name: "Test Item",
  room: "kitchen",
  disposition: "keep",
  ...overrides,
})

describe("InventoryStats", () => {
  describe("Total Count", () => {
    it("shows 0 total items when empty", () => {
      render(<InventoryStats items={[]} />)
      expect(screen.getByText("0 total items")).toBeInTheDocument()
    })

    it("shows correct total item count", () => {
      const items = [createItem(), createItem(), createItem()]
      render(<InventoryStats items={items} />)
      expect(screen.getByText("3 total items")).toBeInTheDocument()
    })
  })

  describe("Disposition Counts", () => {
    it("counts keep items correctly", () => {
      const items = [
        createItem({ disposition: "keep" }),
        createItem({ disposition: "keep" }),
        createItem({ disposition: "sell" }),
      ]
      render(<InventoryStats items={items} />)
      // The "Keep" stat should show 2
      const keepStat = screen.getByText("Keep").parentElement
      expect(keepStat).toHaveTextContent("2")
    })

    it("counts sell items correctly", () => {
      const items = [
        createItem({ disposition: "sell" }),
        createItem({ disposition: "sell" }),
        createItem({ disposition: "sell" }),
      ]
      render(<InventoryStats items={items} />)
      const sellStat = screen.getByText("Sell").parentElement
      expect(sellStat).toHaveTextContent("3")
    })

    it("counts donate items correctly", () => {
      const items = [
        createItem({ disposition: "donate" }),
        createItem({ disposition: "keep" }),
      ]
      render(<InventoryStats items={items} />)
      const donateStat = screen.getByText("Donate").parentElement
      expect(donateStat).toHaveTextContent("1")
    })

    it("counts trash items correctly", () => {
      const items = [
        createItem({ disposition: "trash" }),
        createItem({ disposition: "trash" }),
      ]
      render(<InventoryStats items={items} />)
      const trashStat = screen.getByText("Trash").parentElement
      expect(trashStat).toHaveTextContent("2")
    })

    it("shows zero for dispositions with no items", () => {
      const items = [createItem({ disposition: "keep" })]
      render(<InventoryStats items={items} />)
      const sellStat = screen.getByText("Sell").parentElement
      expect(sellStat).toHaveTextContent("0")
    })
  })

  describe("Sell Value Calculation", () => {
    it("does not show value when no sell items", () => {
      const items = [createItem({ disposition: "keep", value: 100 })]
      render(<InventoryStats items={items} />)
      expect(screen.queryByText("$100")).not.toBeInTheDocument()
    })

    it("does not show value when sell items have no value", () => {
      const items = [createItem({ disposition: "sell" })]
      render(<InventoryStats items={items} />)
      // Should not have any dollar amount displayed beyond the stats
      const sellStat = screen.getByText("Sell").parentElement
      expect(sellStat?.textContent).not.toMatch(/\$\d+/)
    })

    it("calculates total sell value correctly", () => {
      const items = [
        createItem({ disposition: "sell", value: 100 }),
        createItem({ disposition: "sell", value: 250 }),
      ]
      render(<InventoryStats items={items} />)
      expect(screen.getByText("$350")).toBeInTheDocument()
    })

    it("ignores non-sell items in value calculation", () => {
      const items = [
        createItem({ disposition: "sell", value: 100 }),
        createItem({ disposition: "keep", value: 500 }),
        createItem({ disposition: "donate", value: 200 }),
      ]
      render(<InventoryStats items={items} />)
      expect(screen.getByText("$100")).toBeInTheDocument()
      expect(screen.queryByText("$500")).not.toBeInTheDocument()
      expect(screen.queryByText("$800")).not.toBeInTheDocument()
    })

    it("formats large values with commas", () => {
      const items = [
        createItem({ disposition: "sell", value: 1500 }),
        createItem({ disposition: "sell", value: 2500 }),
      ]
      render(<InventoryStats items={items} />)
      expect(screen.getByText("$4,000")).toBeInTheDocument()
    })

    it("handles zero value sell items", () => {
      const items = [
        createItem({ disposition: "sell", value: 0 }),
        createItem({ disposition: "sell", value: 100 }),
      ]
      render(<InventoryStats items={items} />)
      expect(screen.getByText("$100")).toBeInTheDocument()
    })
  })

  describe("Rendering", () => {
    it("renders the title", () => {
      render(<InventoryStats items={[]} />)
      expect(screen.getByText("Inventory Overview")).toBeInTheDocument()
    })

    it("renders all four disposition categories", () => {
      render(<InventoryStats items={[]} />)
      expect(screen.getByText("Keep")).toBeInTheDocument()
      expect(screen.getByText("Sell")).toBeInTheDocument()
      expect(screen.getByText("Donate")).toBeInTheDocument()
      expect(screen.getByText("Trash")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      const { container } = render(
        <InventoryStats items={[]} className="custom-class" />
      )
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain("custom-class")
    })
  })
})
