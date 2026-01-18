import { vi } from "vitest"

// Create a mock query builder that supports chaining
export function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    order: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data : [], error }),
    then: vi.fn((resolve) => resolve({ data, error })),
  }
  return builder
}

// Mock Supabase client factory
export function createMockSupabaseClient(overrides: Record<string, unknown> = {}) {
  const mockFrom = vi.fn(() => createMockQueryBuilder())

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  }

  return {
    from: mockFrom,
    auth: mockAuth,
    ...overrides,
  }
}

// Type for our mock client
export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>
