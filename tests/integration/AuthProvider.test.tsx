import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider, useAuth } from "@/components/providers/auth-provider"
import type { User, Session } from "@supabase/supabase-js"

// Track auth state change callback
let authStateCallback: ((event: string, session: Session | null) => void) | null = null

// Mock Supabase client
const mockSignOut = vi.fn().mockResolvedValue({ error: null })
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn((callback) => {
  authStateCallback = callback
  return {
    data: { subscription: { unsubscribe: vi.fn() } },
  }
})

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

// Test component that uses the auth context
function TestConsumer() {
  const { user, session, isLoading, signOut } = useAuth()

  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="user">{user?.email ?? "no-user"}</span>
      <span data-testid="session">{session ? "has-session" : "no-session"}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStateCallback = null
  })

  describe("Initial State", () => {
    it("starts in loading state", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      // Initially loading
      expect(screen.getByTestId("loading")).toHaveTextContent("loading")

      // Wait for session check
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready")
      })
    })

    it("shows no user when no session exists", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user")
        expect(screen.getByTestId("session")).toHaveTextContent("no-session")
      })
    })

    it("shows user when session exists", async () => {
      const mockUser: Partial<User> = {
        id: "user-123",
        email: "test@example.com",
      }
      const mockSession: Partial<Session> = {
        user: mockUser as User,
        access_token: "token-123",
      }

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com")
        expect(screen.getByTestId("session")).toHaveTextContent("has-session")
      })
    })
  })

  describe("Auth State Changes", () => {
    it("updates when user signs in", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user")
      })

      // Simulate sign in event
      const newSession: Partial<Session> = {
        user: { id: "user-456", email: "new@example.com" } as User,
        access_token: "new-token",
      }

      act(() => {
        authStateCallback?.("SIGNED_IN", newSession as Session)
      })

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("new@example.com")
        expect(screen.getByTestId("session")).toHaveTextContent("has-session")
      })
    })

    it("updates when user signs out", async () => {
      const initialSession: Partial<Session> = {
        user: { id: "user-123", email: "test@example.com" } as User,
        access_token: "token",
      }

      mockGetSession.mockResolvedValue({
        data: { session: initialSession },
        error: null,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com")
      })

      // Simulate sign out event
      act(() => {
        authStateCallback?.("SIGNED_OUT", null)
      })

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user")
        expect(screen.getByTestId("session")).toHaveTextContent("no-session")
      })
    })
  })

  describe("Sign Out", () => {
    it("calls signOut on Supabase client", async () => {
      const user = userEvent.setup()
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready")
      })

      const signOutButton = screen.getByRole("button", { name: /sign out/i })
      await user.click(signOutButton)

      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe("Cleanup", () => {
    it("unsubscribes from auth changes on unmount", async () => {
      const mockUnsubscribe = vi.fn()
      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      })

      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const { unmount } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready")
      })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})
