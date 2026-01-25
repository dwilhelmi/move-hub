import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { LocalStorageDataProvider } from "@/lib/data/local-provider"

describe("LocalStorageDataProvider", () => {
  let provider: LocalStorageDataProvider
  let localStorageMock: Record<string, string>
  const hubId = "test-hub-123"

  beforeEach(() => {
    // Create in-memory localStorage mock
    localStorageMock = {}

    // Mock localStorage methods
    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value
      },
      removeItem: (key: string) => {
        delete localStorageMock[key]
      },
      clear: () => {
        localStorageMock = {}
      },
      get length() {
        return Object.keys(localStorageMock).length
      },
      key: (index: number) => {
        return Object.keys(localStorageMock)[index] || null
      },
    } as Storage

    provider = new LocalStorageDataProvider()
  })

  afterEach(() => {
    localStorageMock = {}
  })

  describe("Tasks", () => {
    it("should get tasks from empty storage", async () => {
      const tasks = await provider.getTasks(hubId)
      expect(tasks).toEqual([])
    })

    it("should add a task", async () => {
      const newTask = {
        title: "Test Task",
        description: "Test description",
        status: "pending" as const,
        priority: "high" as const,
      }

      const result = await provider.addTask(hubId, newTask)

      expect(result.id).toBeDefined()
      expect(result.title).toBe("Test Task")
      expect(result.status).toBe("pending")

      // Verify it was saved
      const tasks = await provider.getTasks(hubId)
      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe(result.id)
    })

    it("should update a task", async () => {
      const task = await provider.addTask(hubId, {
        title: "Original",
        status: "pending" as const,
        priority: "low" as const,
      })

      await provider.updateTask(task.id, { title: "Updated" })

      const tasks = await provider.getTasks(hubId)
      expect(tasks[0].title).toBe("Updated")
      expect(tasks[0].id).toBe(task.id) // ID should not change
    })

    it("should delete a task", async () => {
      const task = await provider.addTask(hubId, {
        title: "To Delete",
        status: "pending" as const,
        priority: "low" as const,
      })

      await provider.deleteTask(task.id)

      const tasks = await provider.getTasks(hubId)
      expect(tasks).toHaveLength(0)
    })

    it("should handle multiple tasks", async () => {
      await provider.addTask(hubId, {
        title: "Task 1",
        status: "pending" as const,
        priority: "high" as const,
      })
      await provider.addTask(hubId, {
        title: "Task 2",
        status: "in-progress" as const,
        priority: "medium" as const,
      })

      const tasks = await provider.getTasks(hubId)
      expect(tasks).toHaveLength(2)
    })
  })

  describe("Expenses", () => {
    it("should get expenses from empty storage", async () => {
      const expenses = await provider.getExpenses(hubId)
      expect(expenses).toEqual([])
    })

    it("should add an expense", async () => {
      const newExpense = {
        description: "Test Expense",
        amount: 100,
        category: "repairs",
        date: "2024-01-01",
      }

      const result = await provider.addExpense(hubId, newExpense)

      expect(result.id).toBeDefined()
      expect(result.description).toBe("Test Expense")
      expect(result.amount).toBe(100)
    })

    it("should sort expenses by date descending", async () => {
      await provider.addExpense(hubId, {
        description: "Old Expense",
        amount: 50,
        category: "repairs",
        date: "2024-01-01",
      })
      await provider.addExpense(hubId, {
        description: "New Expense",
        amount: 75,
        category: "cleaning",
        date: "2024-06-01",
      })

      const expenses = await provider.getExpenses(hubId)
      expect(expenses[0].description).toBe("New Expense") // Newer date first
      expect(expenses[1].description).toBe("Old Expense")
    })

    it("should update an expense", async () => {
      const expense = await provider.addExpense(hubId, {
        description: "Original",
        amount: 100,
        category: "repairs",
        date: "2024-01-01",
      })

      await provider.updateExpense(expense.id, { amount: 150 })

      const expenses = await provider.getExpenses(hubId)
      expect(expenses[0].amount).toBe(150)
    })

    it("should delete an expense", async () => {
      const expense = await provider.addExpense(hubId, {
        description: "To Delete",
        amount: 100,
        category: "repairs",
        date: "2024-01-01",
      })

      await provider.deleteExpense(expense.id)

      const expenses = await provider.getExpenses(hubId)
      expect(expenses).toHaveLength(0)
    })
  })

  describe("Timeline Events", () => {
    it("should get timeline events from empty storage", async () => {
      const events = await provider.getTimelineEvents(hubId)
      expect(events).toEqual([])
    })

    it("should add a timeline event", async () => {
      const newEvent = {
        title: "Moving Day",
        date: "2024-06-01",
        type: "move",
      }

      const result = await provider.addTimelineEvent(hubId, newEvent)

      expect(result.id).toBeDefined()
      expect(result.title).toBe("Moving Day")
    })

    it("should sort timeline events by date ascending", async () => {
      await provider.addTimelineEvent(hubId, {
        title: "Later Event",
        date: "2024-06-01",
        type: "milestone",
      })
      await provider.addTimelineEvent(hubId, {
        title: "Earlier Event",
        date: "2024-01-01",
        type: "task",
      })

      const events = await provider.getTimelineEvents(hubId)
      expect(events[0].title).toBe("Earlier Event") // Earlier date first
      expect(events[1].title).toBe("Later Event")
    })

    it("should update a timeline event", async () => {
      const event = await provider.addTimelineEvent(hubId, {
        title: "Original",
        date: "2024-01-01",
        type: "task",
      })

      await provider.updateTimelineEvent(event.id, { title: "Updated" })

      const events = await provider.getTimelineEvents(hubId)
      expect(events[0].title).toBe("Updated")
    })

    it("should delete a timeline event", async () => {
      const event = await provider.addTimelineEvent(hubId, {
        title: "To Delete",
        date: "2024-01-01",
        type: "task",
      })

      await provider.deleteTimelineEvent(event.id)

      const events = await provider.getTimelineEvents(hubId)
      expect(events).toHaveLength(0)
    })
  })

  describe("Inventory Items", () => {
    it("should get inventory items from empty storage", async () => {
      const items = await provider.getInventoryItems(hubId)
      expect(items).toEqual([])
    })

    it("should add an inventory item", async () => {
      const newItem = {
        name: "Couch",
        room: "living",
        disposition: "keep",
      }

      const result = await provider.addInventoryItem(hubId, newItem)

      expect(result.id).toBeDefined()
      expect(result.name).toBe("Couch")
      expect(result.room).toBe("living")
    })

    it("should update an inventory item", async () => {
      const item = await provider.addInventoryItem(hubId, {
        name: "Chair",
        room: "dining",
        disposition: "keep",
      })

      await provider.updateInventoryItem(item.id, { disposition: "sell" })

      const items = await provider.getInventoryItems(hubId)
      expect(items[0].disposition).toBe("sell")
    })

    it("should delete an inventory item", async () => {
      const item = await provider.addInventoryItem(hubId, {
        name: "Table",
        room: "dining",
        disposition: "donate",
      })

      await provider.deleteInventoryItem(item.id)

      const items = await provider.getInventoryItems(hubId)
      expect(items).toHaveLength(0)
    })
  })

  describe("Move Details", () => {
    it("should get null for empty move details", async () => {
      const details = await provider.getMoveDetails(hubId)
      expect(details).toBeNull()
    })

    it("should save move details", async () => {
      const newDetails = {
        currentAddress: "123 Old St",
        newAddress: "456 New St",
        moveDate: "2024-06-01",
      }

      const result = await provider.saveMoveDetails(hubId, newDetails)

      expect(result.currentAddress).toBe("123 Old St")
      expect(result.newAddress).toBe("456 New St")
      expect(result.createdDate).toBeDefined() // Should auto-set
    })

    it("should preserve createdDate on update", async () => {
      const initial = await provider.saveMoveDetails(hubId, {
        currentAddress: "123 Old St",
      })
      const createdDate = initial.createdDate

      const updated = await provider.saveMoveDetails(hubId, {
        newAddress: "456 New St",
      })

      expect(updated.createdDate).toBe(createdDate)
      expect(updated.currentAddress).toBe("123 Old St")
      expect(updated.newAddress).toBe("456 New St")
    })
  })

  describe("Budget", () => {
    it("should get null for empty budget", async () => {
      const budget = await provider.getBudget(hubId)
      expect(budget).toBeNull()
    })

    it("should save budget", async () => {
      const newBudget = {
        totalBudget: 5000,
        categoryBudgets: { repairs: 1000, cleaning: 500 },
      }

      const result = await provider.saveBudget(hubId, newBudget)

      expect(result.totalBudget).toBe(5000)
      expect(result.categoryBudgets?.repairs).toBe(1000)
    })

    it("should overwrite existing budget", async () => {
      await provider.saveBudget(hubId, {
        totalBudget: 3000,
        categoryBudgets: { movers: 1500 },
      })

      const updated = await provider.saveBudget(hubId, {
        totalBudget: 4000,
        categoryBudgets: { storage: 800 },
      })

      expect(updated.totalBudget).toBe(4000)
      expect(updated.categoryBudgets?.storage).toBe(800)
    })
  })

  describe("Hub Isolation", () => {
    it("should isolate data between different hubs", async () => {
      const hub1 = "hub-1"
      const hub2 = "hub-2"

      await provider.addTask(hub1, {
        title: "Hub 1 Task",
        status: "pending" as const,
        priority: "low" as const,
      })

      await provider.addTask(hub2, {
        title: "Hub 2 Task",
        status: "pending" as const,
        priority: "low" as const,
      })

      const hub1Tasks = await provider.getTasks(hub1)
      const hub2Tasks = await provider.getTasks(hub2)

      expect(hub1Tasks).toHaveLength(1)
      expect(hub2Tasks).toHaveLength(1)
      expect(hub1Tasks[0].title).toBe("Hub 1 Task")
      expect(hub2Tasks[0].title).toBe("Hub 2 Task")
    })
  })

  describe("Server-Side Rendering", () => {
    it("should handle SSR gracefully (no window)", async () => {
      // Simulate server environment
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      const serverProvider = new LocalStorageDataProvider()
      const tasks = await serverProvider.getTasks(hubId)

      expect(tasks).toEqual([])

      // Restore window
      global.window = originalWindow as any
    })
  })

  describe("Error Handling", () => {
    it("should handle JSON parse errors", async () => {
      // Corrupt the stored data
      localStorageMock[`move-hub-${hubId}-tasks`] = "invalid json {"

      const tasks = await provider.getTasks(hubId)
      expect(tasks).toEqual([]) // Should return empty array on error
    })
  })
})
