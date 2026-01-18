import { describe, it, expect } from "vitest"
import {
  cn,
  datetimeLocalToISO,
  isoToDatetimeLocal,
  dateToISO,
  isoToDate,
} from "@/lib/utils"

describe("Utility Functions", () => {
  describe("cn (className utility)", () => {
    it("merges class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar")
    })

    it("handles conditional classes", () => {
      expect(cn("base", true && "active", false && "hidden")).toBe("base active")
    })

    it("merges Tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
    })

    it("handles undefined and null values", () => {
      expect(cn("base", undefined, null, "end")).toBe("base end")
    })
  })

  describe("dateToISO", () => {
    it("returns empty string for empty input", () => {
      expect(dateToISO("")).toBe("")
    })

    it("converts date string to ISO format", () => {
      const result = dateToISO("2024-06-15")
      // Should contain the correct date portion
      expect(result).toMatch(/^2024-06-1[45]T/)
      expect(result).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it("creates a valid Date object", () => {
      const result = dateToISO("2024-12-25")
      const parsed = new Date(result)
      expect(parsed.getFullYear()).toBe(2024)
      expect(parsed.getMonth()).toBe(11) // December is 11
      expect(parsed.getDate()).toBe(25)
    })
  })

  describe("isoToDate", () => {
    it("returns empty string for empty input", () => {
      expect(isoToDate("")).toBe("")
    })

    it("converts ISO string to date input format", () => {
      // Create ISO string at local noon
      const isoString = new Date(2024, 5, 15, 12, 0, 0).toISOString()
      const result = isoToDate(isoString)
      expect(result).toBe("2024-06-15")
    })

    it("handles UTC ISO strings correctly", () => {
      // This test verifies we get local date, not UTC date
      const result = isoToDate("2024-06-15T12:00:00.000Z")
      // Should still be June 15 in most timezones
      expect(result).toMatch(/^2024-06-1[45]$/)
    })
  })

  describe("datetimeLocalToISO", () => {
    it("returns empty string for empty input", () => {
      expect(datetimeLocalToISO("")).toBe("")
    })

    it("converts datetime-local format to ISO", () => {
      const result = datetimeLocalToISO("2024-06-15T10:30")
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it("preserves the time in local timezone", () => {
      const input = "2024-06-15T14:30"
      const result = datetimeLocalToISO(input)
      const parsed = new Date(result)
      expect(parsed.getHours()).toBe(14)
      expect(parsed.getMinutes()).toBe(30)
    })
  })

  describe("isoToDatetimeLocal", () => {
    it("returns empty string for empty input", () => {
      expect(isoToDatetimeLocal("")).toBe("")
    })

    it("converts ISO to datetime-local format", () => {
      const date = new Date(2024, 5, 15, 14, 30, 0)
      const result = isoToDatetimeLocal(date.toISOString())
      expect(result).toBe("2024-06-15T14:30")
    })

    it("produces correct format for datetime-local input", () => {
      const result = isoToDatetimeLocal("2024-12-25T08:00:00.000Z")
      // Format should be YYYY-MM-DDTHH:mm
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    })
  })

  describe("round-trip conversions", () => {
    it("dateToISO -> isoToDate preserves date", () => {
      const original = "2024-07-04"
      const iso = dateToISO(original)
      const result = isoToDate(iso)
      expect(result).toBe(original)
    })

    it("datetimeLocalToISO -> isoToDatetimeLocal preserves datetime", () => {
      const original = "2024-07-04T09:15"
      const iso = datetimeLocalToISO(original)
      const result = isoToDatetimeLocal(iso)
      expect(result).toBe(original)
    })
  })
})
