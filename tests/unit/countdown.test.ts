import { describe, it, expect } from "vitest"
import { calculateTimeRemaining, TimeRemaining } from "@/lib/countdown"

describe("calculateTimeRemaining", () => {
  describe("basic calculations", () => {
    it("returns all zeros when target date is in the past", () => {
      const now = new Date("2024-06-15T12:00:00Z")
      const past = new Date("2024-06-14T12:00:00Z")

      const result = calculateTimeRemaining(past, now)

      expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    })

    it("returns all zeros when target date equals now", () => {
      const now = new Date("2024-06-15T12:00:00Z")

      const result = calculateTimeRemaining(now, now)

      expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    })

    it("calculates exactly 1 day remaining", () => {
      const now = new Date("2024-06-15T12:00:00Z")
      const target = new Date("2024-06-16T12:00:00Z")

      const result = calculateTimeRemaining(target, now)

      expect(result).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0 })
    })

    it("calculates exactly 1 hour remaining", () => {
      const now = new Date("2024-06-15T12:00:00Z")
      const target = new Date("2024-06-15T13:00:00Z")

      const result = calculateTimeRemaining(target, now)

      expect(result).toEqual({ days: 0, hours: 1, minutes: 0, seconds: 0 })
    })

    it("calculates exactly 1 minute remaining", () => {
      const now = new Date("2024-06-15T12:00:00Z")
      const target = new Date("2024-06-15T12:01:00Z")

      const result = calculateTimeRemaining(target, now)

      expect(result).toEqual({ days: 0, hours: 0, minutes: 1, seconds: 0 })
    })

    it("calculates exactly 1 second remaining", () => {
      const now = new Date("2024-06-15T12:00:00Z")
      const target = new Date("2024-06-15T12:00:01Z")

      const result = calculateTimeRemaining(target, now)

      expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 })
    })
  })

  describe("complex time differences", () => {
    it("calculates mixed days, hours, minutes, seconds", () => {
      const now = new Date("2024-06-15T10:30:45Z")
      const target = new Date("2024-06-18T15:45:30Z")
      // Difference: 3 days, 5 hours, 14 minutes, 45 seconds

      const result = calculateTimeRemaining(target, now)

      expect(result.days).toBe(3)
      expect(result.hours).toBe(5)
      expect(result.minutes).toBe(14)
      expect(result.seconds).toBe(45)
    })

    it("handles 30 days correctly", () => {
      const now = new Date("2024-06-01T00:00:00Z")
      const target = new Date("2024-07-01T00:00:00Z")

      const result = calculateTimeRemaining(target, now)

      expect(result.days).toBe(30)
      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(0)
      expect(result.seconds).toBe(0)
    })

    it("handles large number of days (year)", () => {
      const now = new Date("2024-01-01T00:00:00Z")
      const target = new Date("2025-01-01T00:00:00Z")

      const result = calculateTimeRemaining(target, now)

      // 2024 is a leap year, so 366 days
      expect(result.days).toBe(366)
    })

    it("calculates 23:59:59 correctly", () => {
      const now = new Date("2024-06-15T00:00:01Z")
      const target = new Date("2024-06-16T00:00:00Z")

      const result = calculateTimeRemaining(target, now)

      expect(result.days).toBe(0)
      expect(result.hours).toBe(23)
      expect(result.minutes).toBe(59)
      expect(result.seconds).toBe(59)
    })
  })

  describe("edge cases", () => {
    it("handles millisecond precision (rounds down)", () => {
      const now = new Date("2024-06-15T12:00:00.000Z")
      const target = new Date("2024-06-15T12:00:01.999Z")

      const result = calculateTimeRemaining(target, now)

      // Should be 1 second (not 2), as we floor the calculation
      expect(result.seconds).toBe(1)
    })

    it("handles very small difference (less than 1 second)", () => {
      const now = new Date("2024-06-15T12:00:00.000Z")
      const target = new Date("2024-06-15T12:00:00.500Z")

      const result = calculateTimeRemaining(target, now)

      expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    })

    it("handles timezone-aware dates correctly", () => {
      // These represent the same moment in different timezones
      const now = new Date("2024-06-15T12:00:00.000Z")
      const target = new Date("2024-06-16T12:00:00.000Z")

      const result = calculateTimeRemaining(target, now)

      expect(result.days).toBe(1)
    })
  })

  describe("return type", () => {
    it("returns all number properties", () => {
      const now = new Date()
      const target = new Date(now.getTime() + 90061000) // 1 day, 1 hour, 1 min, 1 sec

      const result = calculateTimeRemaining(target, now)

      expect(typeof result.days).toBe("number")
      expect(typeof result.hours).toBe("number")
      expect(typeof result.minutes).toBe("number")
      expect(typeof result.seconds).toBe("number")
    })

    it("never returns negative values", () => {
      const now = new Date("2024-06-15T12:00:00Z")
      const past = new Date("2024-01-01T00:00:00Z")

      const result = calculateTimeRemaining(past, now)

      expect(result.days).toBeGreaterThanOrEqual(0)
      expect(result.hours).toBeGreaterThanOrEqual(0)
      expect(result.minutes).toBeGreaterThanOrEqual(0)
      expect(result.seconds).toBeGreaterThanOrEqual(0)
    })
  })
})
