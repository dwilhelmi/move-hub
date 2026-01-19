import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TaskFilter } from "@/components/move-prep/task-filter"

describe("TaskFilter", () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderTaskFilter = (value: string = "all") => {
    render(
      <TaskFilter
        value={value as Parameters<typeof TaskFilter>[0]["value"]}
        onChange={mockOnChange}
      />
    )
  }

  describe("Rendering", () => {
    it("renders the select component", () => {
      renderTaskFilter()
      expect(screen.getByRole("combobox")).toBeInTheDocument()
    })

    it("displays 'All Tasks' when value is 'all'", () => {
      renderTaskFilter("all")
      expect(screen.getByRole("combobox")).toHaveTextContent("All Tasks")
    })

    it("displays status filter value correctly", () => {
      renderTaskFilter("pending")
      expect(screen.getByRole("combobox")).toHaveTextContent("Status: Pending")
    })

    it("displays in-progress status correctly", () => {
      renderTaskFilter("in-progress")
      expect(screen.getByRole("combobox")).toHaveTextContent("Status: In Progress")
    })

    it("displays completed status correctly", () => {
      renderTaskFilter("completed")
      expect(screen.getByRole("combobox")).toHaveTextContent("Status: Completed")
    })

    it("displays cancelled status correctly", () => {
      renderTaskFilter("cancelled")
      expect(screen.getByRole("combobox")).toHaveTextContent("Status: Cancelled")
    })

    it("displays category filter value correctly", () => {
      renderTaskFilter("repairs")
      expect(screen.getByRole("combobox")).toHaveTextContent("Category: Repairs")
    })

    it("displays staging category correctly", () => {
      renderTaskFilter("staging")
      expect(screen.getByRole("combobox")).toHaveTextContent("Category: Staging")
    })

    it("displays cleaning category correctly", () => {
      renderTaskFilter("cleaning")
      expect(screen.getByRole("combobox")).toHaveTextContent("Category: Cleaning")
    })

    it("displays paperwork category correctly", () => {
      renderTaskFilter("paperwork")
      expect(screen.getByRole("combobox")).toHaveTextContent("Category: Paperwork")
    })
  })

  // Note: Radix UI Select interactions are complex and don't work reliably
  // with happy-dom. Interaction testing for Select components should be done
  // with E2E tests (Playwright) or a more complete DOM implementation.
  // The rendering tests above verify the component displays correctly for all values.
})
