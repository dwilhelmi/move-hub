import { describe, it, expect, beforeEach, vi } from "vitest"
import { migrateGuestDataToDatabase } from "@/lib/data/migration"
import type { DataProvider } from "@/lib/data/types"

describe("Migration", () => {
  let mockProvider: DataProvider
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {}
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key]
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {}
      }),
      get length() {
        return Object.keys(mockLocalStorage).length
      },
      key: vi.fn((index: number) => Object.keys(mockLocalStorage)[index] || null),
    } as Storage

    // Mock DataProvider
    mockProvider = {
      getTasks: vi.fn().mockResolvedValue([]),
      addTask: vi.fn().mockResolvedValue({ id: "new-task-id" }),
      updateTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      getExpenses: vi.fn().mockResolvedValue([]),
      addExpense: vi.fn().mockResolvedValue({ id: "new-expense-id" }),
      updateExpense: vi.fn().mockResolvedValue(undefined),
      deleteExpense: vi.fn().mockResolvedValue(undefined),
      getTimelineEvents: vi.fn().mockResolvedValue([]),
      addTimelineEvent: vi.fn().mockResolvedValue({ id: "new-event-id" }),
      updateTimelineEvent: vi.fn().mockResolvedValue(undefined),
      deleteTimelineEvent: vi.fn().mockResolvedValue(undefined),
      getInventoryItems: vi.fn().mockResolvedValue([]),
      addInventoryItem: vi.fn().mockResolvedValue({ id: "new-item-id" }),
      updateInventoryItem: vi.fn().mockResolvedValue(undefined),
      deleteInventoryItem: vi.fn().mockResolvedValue(undefined),
      getBudget: vi.fn().mockResolvedValue(null),
      saveBudget: vi.fn().mockResolvedValue({ id: "budget-id" }),
      getMoveDetails: vi.fn().mockResolvedValue(null),
      saveMoveDetails: vi.fn().mockResolvedValue({ id: "details-id" }),
    } as unknown as DataProvider

    // Mock fetch for API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-hub-id", name: "Test Hub", created_by: "user-123" }),
    })
  })

  describe("migrateGuestDataToDatabase", () => {
    it("should return success with no migration if no guest data exists", async () => {
      const result = await migrateGuestDataToDatabase("guest-123", "user-123", mockProvider)

      expect(result.success).toBe(true)
      expect(result.newHubId).toBeUndefined()
      expect(fetch).not.toHaveBeenCalled()
    })

    it("should create new hub and migrate all guest data", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      // Set up guest data in localStorage
      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({
        id: guestHubId,
        name: "My Guest Move",
        created_by: guestId,
        created_at: new Date().toISOString(),
      })

      mockLocalStorage[`move-hub-${guestHubId}-tasks`] = JSON.stringify([
        {
          id: "task-1",
          title: "Pack boxes",
          status: "pending",
          priority: "high",
          category: "packing",
        },
      ])

      mockLocalStorage[`move-hub-${guestHubId}-expenses`] = JSON.stringify([
        {
          id: "expense-1",
          title: "Moving truck",
          amount: 500,
          category: "transportation",
          date: "2024-01-15",
        },
      ])

      const result = await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      // Should create hub via API
      expect(fetch).toHaveBeenCalledWith("/api/create-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My Guest Move", userId: "user-123" }),
      })

      // Should migrate tasks
      expect(mockProvider.addTask).toHaveBeenCalledWith("new-hub-id", {
        title: "Pack boxes",
        status: "pending",
        priority: "high",
        category: "packing",
        description: undefined,
        notes: undefined,
        estimatedCost: undefined,
        actualCost: undefined,
      })

      // Should migrate expenses
      expect(mockProvider.addExpense).toHaveBeenCalledWith("new-hub-id", {
        title: "Moving truck",
        amount: 500,
        category: "transportation",
        date: "2024-01-15",
        notes: undefined,
        paymentMethod: undefined,
        vendor: undefined,
      })

      // Should clear guest data
      expect(mockLocalStorage[`move-hub-guest-hub-${guestId}`]).toBeUndefined()
      expect(mockLocalStorage[`move-hub-${guestHubId}-tasks`]).toBeUndefined()
      expect(mockLocalStorage[`move-hub-${guestHubId}-expenses`]).toBeUndefined()

      expect(result.success).toBe(true)
      expect(result.newHubId).toBe("new-hub-id")
    })

    it("should migrate timeline events", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({
        id: guestHubId,
        name: "Test Move",
      })

      mockLocalStorage[`move-hub-${guestHubId}-timeline_events`] = JSON.stringify([
        {
          id: "event-1",
          title: "Moving day",
          date: "2024-02-01",
          category: "logistics",
          isCompleted: false,
        },
      ])

      const result = await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      expect(mockProvider.addTimelineEvent).toHaveBeenCalledWith("new-hub-id", {
        title: "Moving day",
        date: "2024-02-01",
        category: "logistics",
        description: undefined,
        isCompleted: false,
      })

      expect(result.success).toBe(true)
    })

    it("should migrate inventory items", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({
        id: guestHubId,
        name: "Test Move",
      })

      mockLocalStorage[`move-hub-${guestHubId}-inventory_items`] = JSON.stringify([
        {
          id: "item-1",
          name: "Sofa",
          category: "furniture",
          room: "living-room",
          quantity: 1,
          estimatedValue: 1000,
          fragile: false,
        },
      ])

      const result = await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      expect(mockProvider.addInventoryItem).toHaveBeenCalledWith("new-hub-id", {
        name: "Sofa",
        category: "furniture",
        room: "living-room",
        quantity: 1,
        estimatedValue: 1000,
        notes: undefined,
        status: undefined,
        fragile: false,
      })

      expect(result.success).toBe(true)
    })

    it("should migrate budget", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({
        id: guestHubId,
        name: "Test Move",
      })

      mockLocalStorage[`move-hub-${guestHubId}-budget`] = JSON.stringify({
        totalBudget: 5000,
        categories: { transportation: 2000, packing: 1000 },
      })

      const result = await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      expect(mockProvider.saveBudget).toHaveBeenCalledWith("new-hub-id", {
        totalBudget: 5000,
        categories: { transportation: 2000, packing: 1000 },
      })

      expect(result.success).toBe(true)
    })

    it("should migrate move details", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({
        id: guestHubId,
        name: "Test Move",
      })

      mockLocalStorage[`move-hub-${guestHubId}-move_details`] = JSON.stringify({
        moveDate: "2024-02-15",
        fromAddress: "123 Old St",
        toAddress: "456 New Ave",
        movingCompany: "Swift Movers",
        notes: "Handle with care",
      })

      const result = await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      expect(mockProvider.saveMoveDetails).toHaveBeenCalledWith("new-hub-id", {
        moveDate: "2024-02-15",
        fromAddress: "123 Old St",
        toAddress: "456 New Ave",
        movingCompany: "Swift Movers",
        notes: "Handle with care",
      })

      expect(result.success).toBe(true)
    })

    it("should handle API errors gracefully", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({
        id: guestHubId,
        name: "Test Move",
      })

      // Mock API failure
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      const result = await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Failed to create hub in database")

      // Guest data should NOT be cleared on failure
      expect(mockLocalStorage[`move-hub-guest-hub-${guestId}`]).toBeDefined()
    })

    it("should handle missing data gracefully", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      // Only hub exists, no other data
      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({
        id: guestHubId,
        name: "Empty Move",
      })

      const result = await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      // Should still succeed
      expect(result.success).toBe(true)
      expect(result.newHubId).toBe("new-hub-id")

      // Should not call add methods for missing data
      expect(mockProvider.addTask).not.toHaveBeenCalled()
      expect(mockProvider.addExpense).not.toHaveBeenCalled()
      expect(mockProvider.addTimelineEvent).not.toHaveBeenCalled()
      expect(mockProvider.addInventoryItem).not.toHaveBeenCalled()
      expect(mockProvider.saveBudget).not.toHaveBeenCalled()
      expect(mockProvider.saveMoveDetails).not.toHaveBeenCalled()
    })

    it("should clear all guest-related localStorage keys", async () => {
      const guestId = "guest-123"
      const guestHubId = "guest-hub-456"

      // Set up multiple guest data keys
      mockLocalStorage[`move-hub-guest-hub-${guestId}`] = JSON.stringify({ id: guestHubId })
      mockLocalStorage[`move-hub-guest-id`] = guestId
      mockLocalStorage[`move-hub-${guestHubId}-tasks`] = "[]"
      mockLocalStorage[`move-hub-${guestHubId}-expenses`] = "[]"
      mockLocalStorage[`some-other-key`] = "should not be removed"

      await migrateGuestDataToDatabase(guestId, "user-123", mockProvider)

      // All guest keys should be removed
      expect(mockLocalStorage[`move-hub-guest-hub-${guestId}`]).toBeUndefined()
      expect(mockLocalStorage[`move-hub-guest-id`]).toBeUndefined()
      expect(mockLocalStorage[`move-hub-${guestHubId}-tasks`]).toBeUndefined()
      expect(mockLocalStorage[`move-hub-${guestHubId}-expenses`]).toBeUndefined()

      // Non-guest keys should remain
      expect(mockLocalStorage["some-other-key"]).toBe("should not be removed")
    })
  })
})
