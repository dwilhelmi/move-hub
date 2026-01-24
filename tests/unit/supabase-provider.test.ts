import { describe, it, expect, vi, beforeEach } from "vitest"
import { SupabaseDataProvider } from "@/lib/data/supabase-provider"
import { createMockSupabaseClient, createMockQueryBuilder } from "../__mocks__/supabase"
import type { MockSupabaseClient } from "../__mocks__/supabase"

describe("SupabaseDataProvider", () => {
  let mockClient: MockSupabaseClient
  let provider: SupabaseDataProvider
  const hubId = "test-hub-123"

  beforeEach(() => {
    mockClient = createMockSupabaseClient()
    provider = new SupabaseDataProvider(mockClient as any)
  })

  describe("Tasks", () => {
    it("should get tasks", async () => {
      const mockTasks = [
        {
          id: "1",
          hub_id: hubId,
          title: "Test Task",
          status: "pending",
          priority: "high",
          created_at: "2024-01-01",
        },
      ]

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockTasks))

      const tasks = await provider.getTasks(hubId)

      expect(mockClient.from).toHaveBeenCalledWith("tasks")
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe("Test Task")
      expect(tasks[0].status).toBe("pending")
    })

    it("should add a task", async () => {
      const newTask = {
        title: "New Task",
        description: "Test description",
        status: "pending" as const,
        priority: "medium" as const,
      }

      const mockResult = {
        id: "new-task-id",
        hub_id: hubId,
        ...newTask,
        created_at: "2024-01-01",
      }

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockResult))

      const result = await provider.addTask(hubId, newTask)

      expect(mockClient.from).toHaveBeenCalledWith("tasks")
      expect(result.id).toBe("new-task-id")
      expect(result.title).toBe("New Task")
    })

    it("should update a task", async () => {
      const updates = { title: "Updated Title", status: "completed" as const }
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.updateTask("task-123", updates)

      expect(mockClient.from).toHaveBeenCalledWith("tasks")
    })

    it("should delete a task", async () => {
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.deleteTask("task-123")

      expect(mockClient.from).toHaveBeenCalledWith("tasks")
    })
  })

  describe("Expenses", () => {
    it("should get expenses", async () => {
      const mockExpenses = [
        {
          id: "1",
          hub_id: hubId,
          description: "Test Expense",
          amount: 100,
          category: "repairs",
          date: "2024-01-01",
        },
      ]

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockExpenses))

      const expenses = await provider.getExpenses(hubId)

      expect(mockClient.from).toHaveBeenCalledWith("expenses")
      expect(expenses).toHaveLength(1)
      expect(expenses[0].description).toBe("Test Expense")
      expect(expenses[0].amount).toBe(100)
    })

    it("should add an expense", async () => {
      const newExpense = {
        description: "New Expense",
        amount: 50,
        category: "cleaning",
        date: "2024-01-01",
      }

      const mockResult = {
        id: "new-expense-id",
        hub_id: hubId,
        ...newExpense,
      }

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockResult))

      const result = await provider.addExpense(hubId, newExpense)

      expect(mockClient.from).toHaveBeenCalledWith("expenses")
      expect(result.id).toBe("new-expense-id")
      expect(result.description).toBe("New Expense")
    })

    it("should update an expense", async () => {
      const updates = { amount: 75 }
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.updateExpense("expense-123", updates)

      expect(mockClient.from).toHaveBeenCalledWith("expenses")
    })

    it("should delete an expense", async () => {
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.deleteExpense("expense-123")

      expect(mockClient.from).toHaveBeenCalledWith("expenses")
    })
  })

  describe("Timeline Events", () => {
    it("should get timeline events", async () => {
      const mockEvents = [
        {
          id: "1",
          hub_id: hubId,
          title: "Moving Day",
          date: "2024-06-01",
          type: "move",
        },
      ]

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockEvents))

      const events = await provider.getTimelineEvents(hubId)

      expect(mockClient.from).toHaveBeenCalledWith("timeline_events")
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe("Moving Day")
    })

    it("should add a timeline event", async () => {
      const newEvent = {
        title: "Inspection",
        date: "2024-05-01",
        type: "milestone",
      }

      const mockResult = {
        id: "new-event-id",
        hub_id: hubId,
        ...newEvent,
      }

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockResult))

      const result = await provider.addTimelineEvent(hubId, newEvent)

      expect(mockClient.from).toHaveBeenCalledWith("timeline_events")
      expect(result.id).toBe("new-event-id")
      expect(result.title).toBe("Inspection")
    })

    it("should update a timeline event", async () => {
      const updates = { title: "Updated Event" }
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.updateTimelineEvent("event-123", updates)

      expect(mockClient.from).toHaveBeenCalledWith("timeline_events")
    })

    it("should delete a timeline event", async () => {
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.deleteTimelineEvent("event-123")

      expect(mockClient.from).toHaveBeenCalledWith("timeline_events")
    })
  })

  describe("Inventory Items", () => {
    it("should get inventory items", async () => {
      const mockItems = [
        {
          id: "1",
          hub_id: hubId,
          name: "Couch",
          room: "living",
          disposition: "keep",
        },
      ]

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockItems))

      const items = await provider.getInventoryItems(hubId)

      expect(mockClient.from).toHaveBeenCalledWith("inventory_items")
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe("Couch")
    })

    it("should add an inventory item", async () => {
      const newItem = {
        name: "Desk",
        room: "office",
        disposition: "keep",
      }

      const mockResult = {
        id: "new-item-id",
        hub_id: hubId,
        ...newItem,
      }

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockResult))

      const result = await provider.addInventoryItem(hubId, newItem)

      expect(mockClient.from).toHaveBeenCalledWith("inventory_items")
      expect(result.id).toBe("new-item-id")
      expect(result.name).toBe("Desk")
    })

    it("should update an inventory item", async () => {
      const updates = { disposition: "sell" }
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.updateInventoryItem("item-123", updates)

      expect(mockClient.from).toHaveBeenCalledWith("inventory_items")
    })

    it("should delete an inventory item", async () => {
      mockClient.from = vi.fn(() => createMockQueryBuilder())

      await provider.deleteInventoryItem("item-123")

      expect(mockClient.from).toHaveBeenCalledWith("inventory_items")
    })
  })

  describe("Move Details", () => {
    it("should get move details", async () => {
      const mockDetails = {
        id: "1",
        hub_id: hubId,
        current_address: "123 Old St",
        new_address: "456 New St",
        move_date: "2024-06-01",
      }

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockDetails))

      const details = await provider.getMoveDetails(hubId)

      expect(mockClient.from).toHaveBeenCalledWith("move_details")
      expect(details?.currentAddress).toBe("123 Old St")
      expect(details?.newAddress).toBe("456 New St")
    })

    it("should save move details (create)", async () => {
      const newDetails = {
        currentAddress: "123 Old St",
        newAddress: "456 New St",
        moveDate: "2024-06-01",
      }

      // First call returns null (no existing), second returns the created record
      let callCount = 0
      mockClient.from = vi.fn(() => {
        callCount++
        if (callCount === 1) {
          return createMockQueryBuilder(null, { code: "PGRST116" }) // No existing record
        } else {
          return createMockQueryBuilder({
            id: "new-details-id",
            hub_id: hubId,
            current_address: newDetails.currentAddress,
            new_address: newDetails.newAddress,
            move_date: newDetails.moveDate,
          })
        }
      })

      const result = await provider.saveMoveDetails(hubId, newDetails)

      expect(result.currentAddress).toBe("123 Old St")
      expect(result.newAddress).toBe("456 New St")
    })

    it("should save move details (update)", async () => {
      const existingDetails = { id: "existing-id" }
      const updates = { currentAddress: "789 Updated St" }

      // First call returns existing record, second returns the updated record
      let callCount = 0
      mockClient.from = vi.fn(() => {
        callCount++
        if (callCount === 1) {
          return createMockQueryBuilder(existingDetails)
        } else {
          return createMockQueryBuilder({
            id: "existing-id",
            hub_id: hubId,
            current_address: updates.currentAddress,
          })
        }
      })

      const result = await provider.saveMoveDetails(hubId, updates)

      expect(result.currentAddress).toBe("789 Updated St")
    })
  })

  describe("Budget", () => {
    it("should get budget", async () => {
      const mockBudget = {
        id: "1",
        hub_id: hubId,
        total_budget: 5000,
        category_budgets: { repairs: 1000, cleaning: 500 },
      }

      mockClient.from = vi.fn(() => createMockQueryBuilder(mockBudget))

      const budget = await provider.getBudget(hubId)

      expect(mockClient.from).toHaveBeenCalledWith("budgets")
      expect(budget?.totalBudget).toBe(5000)
      expect(budget?.categoryBudgets?.repairs).toBe(1000)
    })

    it("should save budget (create)", async () => {
      const newBudget = {
        totalBudget: 3000,
        categoryBudgets: { movers: 1500 },
      }

      // First call returns null (no existing), second returns the created record
      let callCount = 0
      mockClient.from = vi.fn(() => {
        callCount++
        if (callCount === 1) {
          return createMockQueryBuilder(null, { code: "PGRST116" })
        } else {
          return createMockQueryBuilder({
            id: "new-budget-id",
            hub_id: hubId,
            total_budget: newBudget.totalBudget,
            category_budgets: newBudget.categoryBudgets,
          })
        }
      })

      const result = await provider.saveBudget(hubId, newBudget)

      expect(result.totalBudget).toBe(3000)
      expect(result.categoryBudgets?.movers).toBe(1500)
    })

    it("should save budget (update)", async () => {
      const existingBudget = { id: "existing-id" }
      const updates = { totalBudget: 4000, categoryBudgets: { storage: 800 } }

      // First call returns existing record, second returns the updated record
      let callCount = 0
      mockClient.from = vi.fn(() => {
        callCount++
        if (callCount === 1) {
          return createMockQueryBuilder(existingBudget)
        } else {
          return createMockQueryBuilder({
            id: "existing-id",
            hub_id: hubId,
            total_budget: updates.totalBudget,
            category_budgets: updates.categoryBudgets,
          })
        }
      })

      const result = await provider.saveBudget(hubId, updates)

      expect(result.totalBudget).toBe(4000)
      expect(result.categoryBudgets?.storage).toBe(800)
    })
  })
})
