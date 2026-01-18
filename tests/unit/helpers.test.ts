import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  formatDate,
  formatCurrency as formatCurrencyHousePrep,
} from "@/components/house-prep/constants"
import { formatCurrency as formatCurrencyBudget } from "@/components/budget/constants"

describe("House Prep Helper Functions", () => {
  describe("formatDate", () => {
    it("returns null for undefined input", () => {
      expect(formatDate(undefined)).toBeNull()
    })

    it("returns null for empty string", () => {
      expect(formatDate("")).toBeNull()
    })

    it("formats a valid ISO date string", () => {
      const result = formatDate("2024-06-15T12:00:00.000Z")
      // Format: "Jun 15, 2024" (may vary slightly by locale/timezone)
      expect(result).toMatch(/Jun\s+15,\s+2024/)
    })

    it("formats a date-only string", () => {
      // Use noon UTC to avoid timezone-related date shifts
      const result = formatDate("2024-12-25T12:00:00Z")
      expect(result).toMatch(/Dec\s+25,\s+2024/)
    })

    it("handles different months correctly", () => {
      // Use noon UTC to avoid timezone-related date shifts
      expect(formatDate("2024-01-01T12:00:00Z")).toMatch(/Jan\s+1,\s+2024/)
      expect(formatDate("2024-03-15T12:00:00Z")).toMatch(/Mar\s+15,\s+2024/)
      expect(formatDate("2024-07-04T12:00:00Z")).toMatch(/Jul\s+4,\s+2024/)
      expect(formatDate("2024-11-28T12:00:00Z")).toMatch(/Nov\s+28,\s+2024/)
    })

    it("handles year transitions", () => {
      // Use noon UTC to avoid timezone-related date shifts
      expect(formatDate("2023-12-31T12:00:00Z")).toMatch(/Dec\s+31,\s+2023/)
      expect(formatDate("2025-01-01T12:00:00Z")).toMatch(/Jan\s+1,\s+2025/)
    })
  })

  describe("formatCurrency (house-prep)", () => {
    it("formats zero", () => {
      expect(formatCurrencyHousePrep(0)).toBe("$0.00")
    })

    it("formats whole numbers with cents", () => {
      expect(formatCurrencyHousePrep(100)).toBe("$100.00")
      expect(formatCurrencyHousePrep(1000)).toBe("$1,000.00")
    })

    it("formats decimal amounts", () => {
      expect(formatCurrencyHousePrep(99.99)).toBe("$99.99")
      expect(formatCurrencyHousePrep(1234.56)).toBe("$1,234.56")
    })

    it("formats large amounts with commas", () => {
      expect(formatCurrencyHousePrep(10000)).toBe("$10,000.00")
      expect(formatCurrencyHousePrep(1000000)).toBe("$1,000,000.00")
    })

    it("handles negative amounts", () => {
      expect(formatCurrencyHousePrep(-50)).toBe("-$50.00")
      expect(formatCurrencyHousePrep(-1234.56)).toBe("-$1,234.56")
    })

    it("rounds to two decimal places", () => {
      expect(formatCurrencyHousePrep(10.999)).toBe("$11.00")
      expect(formatCurrencyHousePrep(10.994)).toBe("$10.99")
    })
  })
})

describe("Budget Helper Functions", () => {
  describe("formatCurrency (budget)", () => {
    it("formats zero without decimals", () => {
      expect(formatCurrencyBudget(0)).toBe("$0")
    })

    it("formats whole numbers without decimals", () => {
      expect(formatCurrencyBudget(100)).toBe("$100")
      expect(formatCurrencyBudget(1000)).toBe("$1,000")
    })

    it("rounds decimal amounts to whole numbers", () => {
      expect(formatCurrencyBudget(99.99)).toBe("$100")
      expect(formatCurrencyBudget(99.49)).toBe("$99")
    })

    it("formats large amounts with commas", () => {
      expect(formatCurrencyBudget(10000)).toBe("$10,000")
      expect(formatCurrencyBudget(1000000)).toBe("$1,000,000")
    })

    it("handles negative amounts", () => {
      expect(formatCurrencyBudget(-50)).toBe("-$50")
      expect(formatCurrencyBudget(-1234)).toBe("-$1,234")
    })
  })
})
