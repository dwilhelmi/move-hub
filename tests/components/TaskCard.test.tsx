import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TaskCard } from "@/components/house-prep/task-card"
import { Task } from "@/app/lib/types"

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Test Task",
  status: "pending",
  priority: "medium",
  ...overrides,
})

describe("TaskCard", () => {
  const mockOnToggleComplete = vi.fn()
  const mockOnToggleExpand = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderTaskCard = (
    task: Task = createTask(),
    isExpanded: boolean = false
  ) => {
    return render(
      <TaskCard
        task={task}
        isExpanded={isExpanded}
        onToggleComplete={mockOnToggleComplete}
        onToggleExpand={mockOnToggleExpand}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
  }

  describe("Rendering", () => {
    it("renders task title", () => {
      renderTaskCard(createTask({ title: "My Important Task" }))
      expect(screen.getByText("My Important Task")).toBeInTheDocument()
    })

    it("renders checkbox", () => {
      renderTaskCard()
      expect(screen.getByRole("checkbox")).toBeInTheDocument()
    })

    it("checkbox is unchecked for pending task", () => {
      renderTaskCard(createTask({ status: "pending" }))
      expect(screen.getByRole("checkbox")).not.toBeChecked()
    })

    it("checkbox is checked for completed task", () => {
      renderTaskCard(createTask({ status: "completed" }))
      expect(screen.getByRole("checkbox")).toBeChecked()
    })
  })

  describe("Priority Display", () => {
    it("displays high priority", () => {
      renderTaskCard(createTask({ priority: "high" }))
      expect(screen.getByText("high")).toBeInTheDocument()
    })

    it("displays medium priority", () => {
      renderTaskCard(createTask({ priority: "medium" }))
      expect(screen.getByText("medium")).toBeInTheDocument()
    })

    it("displays low priority", () => {
      renderTaskCard(createTask({ priority: "low" }))
      expect(screen.getByText("low")).toBeInTheDocument()
    })
  })

  describe("Completed State", () => {
    it("applies line-through style to completed task title", () => {
      renderTaskCard(createTask({ status: "completed" }))
      const label = screen.getByText("Test Task")
      expect(label.className).toContain("line-through")
    })

    it("does not apply line-through to pending task title", () => {
      renderTaskCard(createTask({ status: "pending" }))
      const label = screen.getByText("Test Task")
      expect(label.className).not.toContain("line-through")
    })
  })

  describe("Expanded Content", () => {
    it("does not show description when collapsed", () => {
      renderTaskCard(
        createTask({ description: "Task description here" }),
        false
      )
      expect(screen.queryByText("Task description here")).not.toBeInTheDocument()
    })

    it("shows description when expanded", () => {
      renderTaskCard(
        createTask({ description: "Task description here" }),
        true
      )
      expect(screen.getByText("Task description here")).toBeInTheDocument()
    })

    it("shows Description label when expanded with description", () => {
      renderTaskCard(
        createTask({ description: "Some description" }),
        true
      )
      expect(screen.getByText("Description")).toBeInTheDocument()
    })

    it("does not show Description label when no description", () => {
      renderTaskCard(createTask({ description: undefined }), true)
      expect(screen.queryByText("Description")).not.toBeInTheDocument()
    })

    it("shows due date when expanded", () => {
      renderTaskCard(
        createTask({ dueDate: "2024-06-15T12:00:00Z" }),
        true
      )
      // The formatDate function returns "Jun 15, 2024" format
      expect(screen.getByText(/Due:/)).toBeInTheDocument()
    })

    it("does not show due date when not set", () => {
      renderTaskCard(createTask({ dueDate: undefined }), true)
      expect(screen.queryByText(/Due:/)).not.toBeInTheDocument()
    })
  })

  describe("Callbacks", () => {
    it("calls onToggleComplete when checkbox clicked", () => {
      renderTaskCard(createTask({ id: "task-123" }))
      fireEvent.click(screen.getByRole("checkbox"))
      expect(mockOnToggleComplete).toHaveBeenCalledWith("task-123")
    })

    it("calls onEdit when edit button clicked", () => {
      const task = createTask()
      renderTaskCard(task)
      // Find the edit button (has Edit icon)
      const buttons = screen.getAllByRole("button")
      const editButton = buttons[0] // First button is edit
      fireEvent.click(editButton)
      expect(mockOnEdit).toHaveBeenCalledWith(task)
    })

    it("calls onDelete when delete button clicked", () => {
      renderTaskCard(createTask({ id: "task-456" }))
      const buttons = screen.getAllByRole("button")
      const deleteButton = buttons[1] // Second button is delete
      fireEvent.click(deleteButton)
      expect(mockOnDelete).toHaveBeenCalledWith("task-456")
    })

    it("calls onToggleExpand when expand button clicked", () => {
      renderTaskCard(createTask({ id: "task-789" }))
      const buttons = screen.getAllByRole("button")
      const expandButton = buttons[2] // Third button is expand
      fireEvent.click(expandButton)
      expect(mockOnToggleExpand).toHaveBeenCalledWith("task-789")
    })
  })
})
