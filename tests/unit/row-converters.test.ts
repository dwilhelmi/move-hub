import { describe, it, expect } from "vitest"
import {
  rowToMoveDetails,
  rowToTask,
  rowToExpense,
  rowToTimelineEvent,
  rowToInventoryItem,
  rowToBudget,
} from "@/lib/supabase/row-converters"
import type {
  MoveDetailsRow,
  TaskRow,
  ExpenseRow,
  TimelineEventRow,
  InventoryItemRow,
  BudgetRow,
} from "@/lib/supabase/types"

describe("Row Converters", () => {
  describe("rowToMoveDetails", () => {
    it("returns null when input is null", () => {
      expect(rowToMoveDetails(null)).toBeNull()
    })

    it("converts a complete row to MoveDetails", () => {
      const row: MoveDetailsRow = {
        id: "123",
        hub_id: "hub-1",
        current_address: "123 Old St",
        new_address: "456 New Ave",
        move_date: "2024-06-15T10:00:00Z",
        created_date: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToMoveDetails(row)

      expect(result).toEqual({
        currentAddress: "123 Old St",
        newAddress: "456 New Ave",
        moveDate: "2024-06-15T10:00:00Z",
        createdDate: "2024-01-01T00:00:00Z",
      })
    })

    it("converts null fields to undefined", () => {
      const row: MoveDetailsRow = {
        id: "123",
        hub_id: "hub-1",
        current_address: null,
        new_address: null,
        move_date: null,
        created_date: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToMoveDetails(row)

      expect(result).toEqual({
        currentAddress: undefined,
        newAddress: undefined,
        moveDate: undefined,
        createdDate: undefined,
      })
    })
  })

  describe("rowToTask", () => {
    it("converts a complete task row", () => {
      const row: TaskRow = {
        id: "task-1",
        hub_id: "hub-1",
        title: "Pack kitchen",
        description: "Box up all dishes",
        status: "pending",
        priority: "high",
        category: "packing",
        due_date: "2024-06-01",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToTask(row)

      expect(result).toEqual({
        id: "task-1",
        title: "Pack kitchen",
        description: "Box up all dishes",
        status: "pending",
        priority: "high",
        category: "packing",
        dueDate: "2024-06-01",
      })
    })

    it("converts null optional fields to undefined", () => {
      const row: TaskRow = {
        id: "task-1",
        hub_id: "hub-1",
        title: "Simple task",
        description: null,
        status: "pending",
        priority: "low",
        category: null,
        due_date: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToTask(row)

      expect(result.description).toBeUndefined()
      expect(result.category).toBeUndefined()
      expect(result.dueDate).toBeUndefined()
    })
  })

  describe("rowToExpense", () => {
    it("converts an expense row correctly", () => {
      const row: ExpenseRow = {
        id: "exp-1",
        hub_id: "hub-1",
        description: "Moving truck rental",
        amount: 500,
        category: "movers",
        date: "2024-06-15",
        notes: "Includes gas",
        created_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToExpense(row)

      expect(result).toEqual({
        id: "exp-1",
        description: "Moving truck rental",
        amount: 500,
        category: "movers",
        date: "2024-06-15",
        notes: "Includes gas",
      })
    })

    it("handles null notes", () => {
      const row: ExpenseRow = {
        id: "exp-1",
        hub_id: "hub-1",
        description: "Boxes",
        amount: 50,
        category: "packing",
        date: "2024-06-01",
        notes: null,
        created_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToExpense(row)

      expect(result.notes).toBeUndefined()
    })
  })

  describe("rowToTimelineEvent", () => {
    it("converts a timeline event row", () => {
      const row: TimelineEventRow = {
        id: "event-1",
        hub_id: "hub-1",
        title: "Final walkthrough",
        date: "2024-06-14",
        type: "inspection",
        notes: "Bring checklist",
        created_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToTimelineEvent(row)

      expect(result).toEqual({
        id: "event-1",
        title: "Final walkthrough",
        date: "2024-06-14",
        type: "inspection",
        notes: "Bring checklist",
      })
    })
  })

  describe("rowToInventoryItem", () => {
    it("converts a complete inventory item row", () => {
      const row: InventoryItemRow = {
        id: "item-1",
        hub_id: "hub-1",
        name: "Sofa",
        room: "living",
        disposition: "sell",
        box: null,
        value: 800,
        notes: "Good condition",
        sold: true,
        sold_amount: 600,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToInventoryItem(row)

      expect(result).toEqual({
        id: "item-1",
        name: "Sofa",
        room: "living",
        disposition: "sell",
        box: undefined,
        value: 800,
        notes: "Good condition",
        sold: true,
        soldAmount: 600,
      })
    })

    it("handles item marked for keeping with box label", () => {
      const row: InventoryItemRow = {
        id: "item-2",
        hub_id: "hub-1",
        name: "Books",
        room: "office",
        disposition: "keep",
        box: "Box 12",
        value: null,
        notes: null,
        sold: false,
        sold_amount: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToInventoryItem(row)

      expect(result.box).toBe("Box 12")
      expect(result.value).toBeUndefined()
      // Note: sold=false is converted to undefined by the || operator
      // This is the current behavior - consider using ?? if false should be preserved
      expect(result.sold).toBeUndefined()
      expect(result.soldAmount).toBeUndefined()
    })
  })

  describe("rowToBudget", () => {
    it("returns null when input is null", () => {
      expect(rowToBudget(null)).toBeNull()
    })

    it("converts a budget row with category budgets", () => {
      const row: BudgetRow = {
        id: "budget-1",
        hub_id: "hub-1",
        total_budget: 10000,
        category_budgets: { movers: 3000, packing: 500, storage: 1000 },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToBudget(row)

      expect(result).toEqual({
        totalBudget: 10000,
        categoryBudgets: { movers: 3000, packing: 500, storage: 1000 },
      })
    })

    it("handles null category budgets", () => {
      const row: BudgetRow = {
        id: "budget-1",
        hub_id: "hub-1",
        total_budget: 5000,
        category_budgets: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = rowToBudget(row)

      // Note: null is passed through as-is (cast to undefined type but still null)
      // This tests the current behavior
      expect(result?.totalBudget).toBe(5000)
      expect(result?.categoryBudgets).toBeNull()
    })
  })
})
