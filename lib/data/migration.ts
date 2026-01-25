import { DataProvider } from "./types"
import type { Hub } from "@/lib/supabase/types"

export interface MigrationResult {
  success: boolean
  newHubId?: string
  error?: string
}

/**
 * Migrates guest data from localStorage to the database for a newly authenticated user.
 *
 * This function:
 * 1. Loads all guest data from localStorage
 * 2. Creates a new hub in the database for the authenticated user
 * 3. Migrates all guest data (tasks, expenses, timeline events, inventory, budget, move details) to the new hub
 * 4. Clears guest data from localStorage on success
 *
 * @param guestId - The guest's UUID from localStorage
 * @param userId - The authenticated user's ID from Supabase
 * @param provider - The DataProvider instance (should be in database mode)
 * @returns MigrationResult with success status and new hub ID or error message
 */
export async function migrateGuestDataToDatabase(
  guestId: string,
  userId: string,
  provider: DataProvider
): Promise<MigrationResult> {
  if (typeof window === "undefined") {
    return { success: false, error: "Migration can only run in browser" }
  }

  try {
    // 1. Load guest hub from localStorage
    const guestHubKey = `move-hub-guest-hub-${guestId}`
    const guestHubJson = localStorage.getItem(guestHubKey)

    if (!guestHubJson) {
      // No guest data to migrate - this is OK
      return { success: true, newHubId: undefined }
    }

    const guestHub = JSON.parse(guestHubJson)
    const guestHubId = guestHub.id
    const hubName = guestHub.name || "My Move"

    // 2. Create new hub in database
    // Note: The database trigger will automatically add the user as owner
    const createHubResponse = await fetch("/api/create-hub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: hubName, userId }),
    })

    if (!createHubResponse.ok) {
      throw new Error("Failed to create hub in database")
    }

    const newHub: Hub = await createHubResponse.json()
    const newHubId = newHub.id

    // 3. Migrate all data types from localStorage to database
    await Promise.all([
      migrateTasks(guestHubId, newHubId, provider),
      migrateExpenses(guestHubId, newHubId, provider),
      migrateTimelineEvents(guestHubId, newHubId, provider),
      migrateInventoryItems(guestHubId, newHubId, provider),
      migrateBudget(guestHubId, newHubId, provider),
      migrateMoveDetails(guestHubId, newHubId, provider),
    ])

    // 4. Clear all guest data from localStorage
    clearGuestData(guestId)

    return { success: true, newHubId }
  } catch (error) {
    console.error("Migration failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during migration",
    }
  }
}

/**
 * Migrate tasks from guest localStorage to database
 */
async function migrateTasks(
  guestHubId: string,
  newHubId: string,
  provider: DataProvider
): Promise<void> {
  const tasksKey = `move-hub-${guestHubId}-tasks`
  const tasksJson = localStorage.getItem(tasksKey)
  if (!tasksJson) return

  const tasks = JSON.parse(tasksJson)
  await Promise.all(
    tasks.map((task: any) =>
      provider.addTask(newHubId, {
        title: task.title,
        status: task.status,
        priority: task.priority,
        category: task.category,
        description: task.description,
        notes: task.notes,
        estimatedCost: task.estimatedCost,
        actualCost: task.actualCost,
      })
    )
  )
}

/**
 * Migrate expenses from guest localStorage to database
 */
async function migrateExpenses(
  guestHubId: string,
  newHubId: string,
  provider: DataProvider
): Promise<void> {
  const expensesKey = `move-hub-${guestHubId}-expenses`
  const expensesJson = localStorage.getItem(expensesKey)
  if (!expensesJson) return

  const expenses = JSON.parse(expensesJson)
  await Promise.all(
    expenses.map((expense: any) =>
      provider.addExpense(newHubId, {
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes,
        paymentMethod: expense.paymentMethod,
        vendor: expense.vendor,
      })
    )
  )
}

/**
 * Migrate timeline events from guest localStorage to database
 */
async function migrateTimelineEvents(
  guestHubId: string,
  newHubId: string,
  provider: DataProvider
): Promise<void> {
  const eventsKey = `move-hub-${guestHubId}-timeline_events`
  const eventsJson = localStorage.getItem(eventsKey)
  if (!eventsJson) return

  const events = JSON.parse(eventsJson)
  await Promise.all(
    events.map((event: any) =>
      provider.addTimelineEvent(newHubId, {
        title: event.title,
        date: event.date,
        category: event.category,
        description: event.description,
        isCompleted: event.isCompleted,
      })
    )
  )
}

/**
 * Migrate inventory items from guest localStorage to database
 */
async function migrateInventoryItems(
  guestHubId: string,
  newHubId: string,
  provider: DataProvider
): Promise<void> {
  const itemsKey = `move-hub-${guestHubId}-inventory_items`
  const itemsJson = localStorage.getItem(itemsKey)
  if (!itemsJson) return

  const items = JSON.parse(itemsJson)
  await Promise.all(
    items.map((item: any) =>
      provider.addInventoryItem(newHubId, {
        name: item.name,
        category: item.category,
        room: item.room,
        quantity: item.quantity,
        estimatedValue: item.estimatedValue,
        notes: item.notes,
        status: item.status,
        fragile: item.fragile,
      })
    )
  )
}

/**
 * Migrate budget from guest localStorage to database
 */
async function migrateBudget(
  guestHubId: string,
  newHubId: string,
  provider: DataProvider
): Promise<void> {
  const budgetKey = `move-hub-${guestHubId}-budget`
  const budgetJson = localStorage.getItem(budgetKey)
  if (!budgetJson) return

  const budget = JSON.parse(budgetJson)
  await provider.saveBudget(newHubId, {
    totalBudget: budget.totalBudget,
    categories: budget.categories,
  })
}

/**
 * Migrate move details from guest localStorage to database
 */
async function migrateMoveDetails(
  guestHubId: string,
  newHubId: string,
  provider: DataProvider
): Promise<void> {
  const detailsKey = `move-hub-${guestHubId}-move_details`
  const detailsJson = localStorage.getItem(detailsKey)
  if (!detailsJson) return

  const details = JSON.parse(detailsJson)
  await provider.saveMoveDetails(newHubId, {
    moveDate: details.moveDate,
    fromAddress: details.fromAddress,
    toAddress: details.toAddress,
    movingCompany: details.movingCompany,
    notes: details.notes,
  })
}

/**
 * Clear all guest data from localStorage
 */
function clearGuestData(guestId: string): void {
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (
      key &&
      (key.startsWith("move-hub-guest-") ||
        (key.startsWith("move-hub-") && key.includes("-")))
    ) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key))
}
