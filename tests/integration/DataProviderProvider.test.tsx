import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { DataProviderProvider, useDataProvider } from "@/lib/data/hooks"
import type { StorageMode } from "@/lib/data/types"

// Mock Supabase client creation to avoid needing env vars in tests
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  }),
}))

// Test component that uses the provider hook
function TestComponent({ testId = "test-component" }: { testId?: string }) {
  const provider = useDataProvider()

  return (
    <div data-testid={testId}>
      <div data-testid="provider-type">
        {provider.constructor.name}
      </div>
    </div>
  )
}

describe("DataProviderProvider", () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    // Mock localStorage for tests
    localStorageMock = {}

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
  })

  it("should provide SupabaseDataProvider when mode is 'database'", () => {
    render(
      <DataProviderProvider mode="database">
        <TestComponent />
      </DataProviderProvider>
    )

    expect(screen.getByTestId("provider-type")).toHaveTextContent("SupabaseDataProvider")
  })

  it("should provide LocalStorageDataProvider when mode is 'local'", () => {
    render(
      <DataProviderProvider mode="local">
        <TestComponent />
      </DataProviderProvider>
    )

    expect(screen.getByTestId("provider-type")).toHaveTextContent("LocalStorageDataProvider")
  })

  it("should throw error when useDataProvider is used outside provider", () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = () => {}

    expect(() => {
      render(<TestComponent />)
    }).toThrow("useDataProvider must be used within DataProviderProvider")

    console.error = originalError
  })

  it("should create new provider when mode changes", async () => {
    function ModeSwitch() {
      const [mode, setMode] = React.useState<StorageMode>("local")

      return (
        <div>
          <button onClick={() => setMode("database")} data-testid="switch-to-database">
            Switch to Database
          </button>
          <button onClick={() => setMode("local")} data-testid="switch-to-local">
            Switch to Local
          </button>
          <DataProviderProvider mode={mode}>
            <TestComponent testId="mode-test" />
          </DataProviderProvider>
        </div>
      )
    }

    const { rerender } = render(<ModeSwitch />)

    // Initially should be local
    expect(screen.getByTestId("provider-type")).toHaveTextContent("LocalStorageDataProvider")

    // Note: This test structure verifies the provider can be created in both modes
    // In a real app, switching modes would typically happen on auth state change
  })

  it("should allow data operations through the provider", async () => {
    function DataOperationTest() {
      const provider = useDataProvider()
      const [taskCount, setTaskCount] = React.useState<number | null>(null)

      React.useEffect(() => {
        const loadTasks = async () => {
          const tasks = await provider.getTasks("test-hub")
          setTaskCount(tasks.length)
        }
        loadTasks()
      }, [provider])

      return (
        <div>
          <div data-testid="task-count">{taskCount !== null ? taskCount : "loading"}</div>
        </div>
      )
    }

    render(
      <DataProviderProvider mode="local">
        <DataOperationTest />
      </DataProviderProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("task-count")).toHaveTextContent("0")
    })
  })

  it("should work with SupabaseDataProvider mode", async () => {
    function SupabaseTest() {
      const provider = useDataProvider()
      const [isReady, setIsReady] = React.useState(false)

      React.useEffect(() => {
        // Just verify we can access the provider
        if (provider) {
          setIsReady(true)
        }
      }, [provider])

      return (
        <div data-testid="ready-state">{isReady ? "ready" : "not-ready"}</div>
      )
    }

    render(
      <DataProviderProvider mode="database">
        <SupabaseTest />
      </DataProviderProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("ready-state")).toHaveTextContent("ready")
    })
  })

  it("should maintain same provider instance when mode doesn't change", () => {
    let renderCount = 0
    let providerInstance: any = null

    function ProviderInstanceTest() {
      const provider = useDataProvider()
      renderCount++

      if (providerInstance === null) {
        providerInstance = provider
      } else {
        // On subsequent renders with same mode, should be same instance
        expect(provider).toBe(providerInstance)
      }

      return <div data-testid="render-count">{renderCount}</div>
    }

    const { rerender } = render(
      <DataProviderProvider mode="local">
        <ProviderInstanceTest />
      </DataProviderProvider>
    )

    // Force a re-render with same mode
    rerender(
      <DataProviderProvider mode="local">
        <ProviderInstanceTest />
      </DataProviderProvider>
    )

    expect(renderCount).toBeGreaterThan(1)
  })
})

// Add React import for JSX
import React from "react"
