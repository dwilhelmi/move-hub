import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProgressOverview } from "@/components/move-prep/progress-overview"

describe("ProgressOverview", () => {
  describe("Rendering", () => {
    it("renders the component with title", () => {
      render(<ProgressOverview completedCount={0} totalCount={0} />)
      expect(screen.getByText("Task Progress")).toBeInTheDocument()
    })

    it("displays completion count text", () => {
      render(<ProgressOverview completedCount={3} totalCount={10} />)
      expect(screen.getByText("3 of 10 completed")).toBeInTheDocument()
    })
  })

  describe("Progress Calculation", () => {
    it("shows 0% when no tasks exist", () => {
      render(<ProgressOverview completedCount={0} totalCount={0} />)
      expect(screen.getByText("0% complete - keep going! 🎉")).toBeInTheDocument()
    })

    it("shows 0% when no tasks completed", () => {
      render(<ProgressOverview completedCount={0} totalCount={5} />)
      expect(screen.getByText("0% complete - keep going! 🎉")).toBeInTheDocument()
    })

    it("calculates 50% correctly", () => {
      render(<ProgressOverview completedCount={5} totalCount={10} />)
      expect(screen.getByText("50% complete - keep going! 🎉")).toBeInTheDocument()
    })

    it("calculates 100% correctly", () => {
      render(<ProgressOverview completedCount={10} totalCount={10} />)
      expect(screen.getByText("100% complete - keep going! 🎉")).toBeInTheDocument()
    })

    it("rounds percentage to nearest whole number", () => {
      render(<ProgressOverview completedCount={1} totalCount={3} />)
      // 1/3 = 33.33...% should round to 33%
      expect(screen.getByText("33% complete - keep going! 🎉")).toBeInTheDocument()
    })

    it("rounds 66.66% to 67%", () => {
      render(<ProgressOverview completedCount={2} totalCount={3} />)
      expect(screen.getByText("67% complete - keep going! 🎉")).toBeInTheDocument()
    })
  })

  describe("Progress Bar", () => {
    it("sets progress bar width to 0% when no tasks", () => {
      const { container } = render(
        <ProgressOverview completedCount={0} totalCount={0} />
      )
      const progressBar = container.querySelector(
        '[style*="width"]'
      ) as HTMLElement
      expect(progressBar?.style.width).toBe("0%")
    })

    it("sets progress bar width to 50%", () => {
      const { container } = render(
        <ProgressOverview completedCount={5} totalCount={10} />
      )
      const progressBar = container.querySelector(
        '[style*="width"]'
      ) as HTMLElement
      expect(progressBar?.style.width).toBe("50%")
    })

    it("sets progress bar width to 100%", () => {
      const { container } = render(
        <ProgressOverview completedCount={10} totalCount={10} />
      )
      const progressBar = container.querySelector(
        '[style*="width"]'
      ) as HTMLElement
      expect(progressBar?.style.width).toBe("100%")
    })
  })

  describe("Custom className", () => {
    it("applies custom className to the card", () => {
      const { container } = render(
        <ProgressOverview
          completedCount={0}
          totalCount={0}
          className="custom-class"
        />
      )
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain("custom-class")
    })
  })
})
