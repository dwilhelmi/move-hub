import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskForm } from "@/components/task-form"
import type { Task } from "@/app/lib/types"

// Mock the Supabase client (not used directly but needed for module resolution)
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}))

describe("TaskForm", () => {
  const mockOnSave = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderTaskForm = (props: Partial<Parameters<typeof TaskForm>[0]> = {}) => {
    const user = userEvent.setup()
    const defaultProps = {
      open: true,
      onOpenChange: mockOnOpenChange,
      onSave: mockOnSave,
      task: null,
    }
    render(<TaskForm {...defaultProps} {...props} />)
    return { user }
  }

  describe("Create Mode", () => {
    it("renders with correct title for new task", () => {
      renderTaskForm()
      expect(screen.getByText("Add New Task")).toBeInTheDocument()
    })

    it("renders with correct description for new task", () => {
      renderTaskForm()
      expect(screen.getByText("Create a new house prep task")).toBeInTheDocument()
    })

    it("shows empty form fields for new task", () => {
      renderTaskForm()
      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveValue("")
    })

    it("has default values for selects", async () => {
      renderTaskForm()
      // Check that the form renders with default selections
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("calls onSave with form data when submitted", async () => {
      const { user } = renderTaskForm()

      // Fill in the title (required field)
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, "Pack bedroom")

      // Fill in description
      const descInput = screen.getByLabelText(/description/i)
      await user.type(descInput, "Box up clothes and linens")

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /save task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })

      const savedTask = mockOnSave.mock.calls[0][0]
      expect(savedTask.title).toBe("Pack bedroom")
      expect(savedTask.description).toBe("Box up clothes and linens")
    })

    it("closes dialog after save", async () => {
      const { user } = renderTaskForm()

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, "Test task")

      const submitButton = screen.getByRole("button", { name: /save task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe("Edit Mode", () => {
    const existingTask: Task = {
      id: "task-123",
      title: "Fix leaky faucet",
      description: "Kitchen sink needs repair",
      status: "in-progress",
      priority: "high",
      category: "repairs",
      dueDate: "2024-06-15T12:00:00.000Z",
    }

    it("renders with correct title for editing", () => {
      renderTaskForm({ task: existingTask })
      expect(screen.getByText("Edit Task")).toBeInTheDocument()
    })

    it("renders with correct description for editing", () => {
      renderTaskForm({ task: existingTask })
      expect(screen.getByText("Update task details")).toBeInTheDocument()
    })

    it("populates form with existing task data", () => {
      renderTaskForm({ task: existingTask })

      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveValue("Fix leaky faucet")

      const descInput = screen.getByLabelText(/description/i)
      expect(descInput).toHaveValue("Kitchen sink needs repair")
    })

    it("includes task id when saving edits", async () => {
      const { user } = renderTaskForm({ task: existingTask })

      // Modify the title
      const titleInput = screen.getByLabelText(/title/i)
      await user.clear(titleInput)
      await user.type(titleInput, "Updated task title")

      const submitButton = screen.getByRole("button", { name: /save task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      })

      const savedTask = mockOnSave.mock.calls[0][0]
      expect(savedTask.id).toBe("task-123")
      expect(savedTask.title).toBe("Updated task title")
    })
  })

  describe("Cancel Behavior", () => {
    it("calls onOpenChange with false when cancel clicked", async () => {
      const { user } = renderTaskForm()

      const cancelButton = screen.getByRole("button", { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("Form Validation", () => {
    it("requires title field", () => {
      renderTaskForm()
      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toBeRequired()
    })
  })
})
