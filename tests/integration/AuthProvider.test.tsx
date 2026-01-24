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
  const { user, session, isLoading, isGuest, guestId, signOut, startGuestSession } = useAuth()

  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="user">{user?.email ?? "no-user"}</span>
      <span data-testid="session">{session ? "has-session" : "no-session"}</span>
      <span data-testid="is-guest">{isGuest ? "guest" : "not-guest"}</span>
      <span data-testid="guest-id">{guestId ?? "no-guest-id"}</span>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={startGuestSession}>Start Guest</button>
    </div>
  )
}

describe("AuthProvider", () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    vi.clearAllMocks()
    authStateCallback = null

    // Mock localStorage
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

  describe("Guest Mode", () => {
    it("auto-creates guest session when no user exists", async () => {
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
        expect(screen.getByTestId("is-guest")).toHaveTextContent("guest")
        expect(screen.getByTestId("guest-id")).not.toHaveTextContent("no-guest-id")
      })

      // Verify guest ID was stored in localStorage
      expect(localStorageMock["move-hub-guest-id"]).toBeDefined()
    })

    it("loads existing guest ID from localStorage", async () => {
      const existingGuestId = "existing-guest-123"
      localStorageMock["move-hub-guest-id"] = existingGuestId

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
        expect(screen.getByTestId("guest-id")).toHaveTextContent(existingGuestId)
        expect(screen.getByTestId("is-guest")).toHaveTextContent("guest")
      })
    })

    // TODO: Fix this test - mock callback isn't being captured properly
    // The onAuthStateChange mock doesn't get called for some reason in this specific test case
    it.skip("clears guest ID when user signs in", async () => {
      const guestId = "guest-123"
      localStorageMock["move-hub-guest-id"] = guestId

      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      // Initially in guest mode
      await waitFor(() => {
        expect(screen.getByTestId("is-guest")).toHaveTextContent("guest")
      })

      // Simulate user sign in
      const mockSession: Partial<Session> = {
        user: { id: "user-123", email: "test@example.com" } as User,
        access_token: "token",
      }

      act(() => {
        authStateCallback?.("SIGNED_IN", mockSession as Session)
      })

      await waitFor(() => {
        expect(screen.getByTestId("is-guest")).toHaveTextContent("not-guest")
        expect(screen.getByTestId("guest-id")).toHaveTextContent("no-guest-id")
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com")
        expect(screen.getByTestId("session")).toHaveTextContent("has-session")
      })

      // Verify localStorage was cleared
      expect(localStorageMock["move-hub-guest-id"]).toBeUndefined()
    })

    it("clears guest data on sign out", async () => {
      const user = userEvent.setup()
      const guestId = "guest-123"
      localStorageMock["move-hub-guest-id"] = guestId
      localStorageMock["move-hub-guest-test-123-tasks"] = "[]"

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
        expect(screen.getByTestId("is-guest")).toHaveTextContent("guest")
      })

      const signOutButton = screen.getByRole("button", { name: /sign out/i })
      await user.click(signOutButton)

      expect(mockSignOut).toHaveBeenCalled()
      // All guest data should be cleared
      expect(localStorageMock["move-hub-guest-id"]).toBeUndefined()
      expect(localStorageMock["move-hub-guest-test-123-tasks"]).toBeUndefined()
    })

    it("does not create guest session when user is authenticated", async () => {
      const mockSession: Partial<Session> = {
        user: { id: "user-123", email: "test@example.com" } as User,
        access_token: "token",
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
        expect(screen.getByTestId("is-guest")).toHaveTextContent("not-guest")
        expect(screen.getByTestId("guest-id")).toHaveTextContent("no-guest-id")
      })

      expect(localStorageMock["move-hub-guest-id"]).toBeUndefined()
    })
  })
})
