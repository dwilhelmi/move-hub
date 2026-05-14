# Components

This document describes the component structure and code patterns used in the application.

## Component Directory Structure

```
components/
├── ui/                    # Reusable UI primitives (shadcn/ui pattern)
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── badge.tsx
│   └── theme-toggle.tsx
│
├── providers/             # React context providers
│   ├── auth-provider.tsx  # Authentication state and guest management
│   ├── data-provider-provider.tsx  # Data access abstraction
│   └── hub-provider.tsx   # Hub/multi-tenancy state management
│
├── house-prep/            # House preparation feature components
│   ├── tasks-tab.tsx
│   ├── task-card.tsx
│   ├── task-filter.tsx
│   ├── expenses-tab.tsx
│   ├── expense-item.tsx
│   ├── progress-overview.tsx
│   └── delete-confirm-dialog.tsx
│
├── timeline/              # Timeline feature components
│   ├── timeline-list.tsx
│   ├── timeline-event-card.tsx
│   ├── today-marker.tsx
│   ├── edit-start-date-dialog.tsx
│   └── constants.tsx
│
├── inventory/             # Inventory feature components
│   ├── inventory-list.tsx
│   ├── inventory-item-card.tsx
│   ├── inventory-filter.tsx
│   └── inventory-stats.tsx
│
├── budget/                # Budget feature components
│   ├── budget-overview.tsx
│   ├── budget-category-breakdown.tsx
│   ├── budget-settings-form.tsx
│   └── selling-income.tsx
│
└── [root-level]           # Shared/cross-feature components
    ├── task-form.tsx          # Task create/edit dialog
    ├── expense-form.tsx       # Expense create/edit dialog
    ├── inventory-item-form.tsx # Inventory item create/edit dialog
    ├── timeline-event-form.tsx # Timeline event create/edit dialog
    ├── move-details-form.tsx  # Move details form
    ├── move-details-card.tsx  # Move details display card
    ├── moving-countdown.tsx   # Countdown timer display
    ├── hub-setup.tsx          # Initial hub creation flow
    ├── guest-save-prompt.tsx  # Guest signup prompt modal
    ├── sidebar.tsx            # Desktop sidebar (hidden on mobile)
    ├── sidebar-content.tsx    # Shared sidebar content (with guest indicator)
    ├── mobile-sidebar.tsx     # Mobile drawer sidebar
    ├── mobile-header.tsx      # Mobile header bar
    └── mobile-menu-button.tsx # Hamburger menu button
```

## Provider API

### AuthProvider

Manages user authentication state and guest mode via Supabase Auth.

```typescript
interface AuthContextType {
  user: User | null           // Current Supabase user object (null for guests)
  session: Session | null     // Current auth session (null for guests)
  isLoading: boolean          // True while checking initial auth state
  isGuest: boolean            // True if user is in guest mode
  guestId: string | null      // UUID for guest users
  signOut: () => Promise<void> // Sign out (clears guest data too)
}

// Usage
const { user, session, isLoading, isGuest, guestId, signOut } = useAuth()
```

### DataProviderProvider

Provides data access abstraction that switches between database and localStorage.

```typescript
// Usage
const provider = useDataProvider()

// All data operations use the same API regardless of storage mode
const tasks = await provider.getTasks(hubId)
await provider.addTask(hubId, taskData)
await provider.updateTask(taskId, updates)
await provider.deleteTask(taskId)
```

### HubProvider

Manages the current hub context for multi-tenancy.

```typescript
interface HubContextType {
  hub: HubWithMembers | null  // Current hub with member list
  isLoading: boolean          // True while fetching hub
  isOwner: boolean            // True if current user owns the hub
  refreshHub: () => Promise<void>                           // Refetch hub data
  createHub: (name?: string) => Promise<Hub | null>         // Create new hub
  updateHubName: (name: string) => Promise<void>            // Rename hub
  inviteMember: (email: string) => Promise<InviteResult>    // Add member by email
  removeMember: (userId: string) => Promise<void>           // Remove member
}

// Usage
const { hub, isLoading, isOwner, createHub, inviteMember } = useHub()
```

## Code Patterns

### Page Components

All pages must follow this pattern:

```typescript
"use client"

import { useHub } from "@/components/providers/hub-provider"
import { HubSetup } from "@/components/hub-setup"

export default function FeaturePage() {
  const { hub, isLoading } = useHub()

  // 1. Handle loading state
  if (isLoading) {
    return <LoadingState />
  }

  // 2. Handle no hub (show setup)
  if (!hub) {
    return <HubSetup />
  }

  // 3. Render page content with hub.id for data fetching
  return <PageContent hubId={hub.id} />
}
```

### Form Components

Forms use controlled components with `useState`:

```typescript
"use client"

export function EntityForm({ entity, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState<FormData>(defaultValues)

  // Reset form when dialog opens/closes or entity changes
  useEffect(() => {
    if (entity) {
      setFormData(entityToFormData(entity))
    } else {
      setFormData(defaultValues)
    }
  }, [entity, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(entity ? { ...entity, ...formData } : formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Form File Organization

Form components (task-form, expense-form, etc.) live at the root `components/` level rather than in feature directories because:

1. **Cross-feature usage**: Forms are often used from multiple pages (e.g., task-form from both dashboard and house-prep)
2. **Consistent API**: All forms follow the same props pattern (`entity`, `open`, `onOpenChange`, `onSave`)
3. **Dialog pattern**: Forms are wrapped in Dialog components, making them reusable modals

Feature-specific forms (like `budget-settings-form.tsx`) that are only used within one feature remain in that feature's directory.

### Data Access

All data operations use the DataProvider abstraction via `useDataProvider()` hook:

```typescript
import { useDataProvider } from "@/lib/data/hooks"
import type { Task, TaskStatus } from "@/lib/supabase/database"

export default function FeaturePage() {
  const { hub } = useHub()
  const provider = useDataProvider()

  // Provider automatically uses database or localStorage based on auth state
  const tasks = await provider.getTasks(hub.id)
  const newTask = await provider.addTask(hub.id, taskData)
  await provider.updateTask(taskId, updates)
  await provider.deleteTask(taskId)
}
```

**Important**:
- Never import database functions directly in pages/components
- Always use `useDataProvider()` hook for data access
- This ensures guest mode works seamlessly

### Type Imports

Import types from `@/lib/supabase/database` for consistency:

```typescript
// Correct - single source of truth
import { Task, TaskStatus, TaskPriority } from "@/lib/supabase/database"

// Avoid - legacy path
import { Task } from "@/app/lib/types"
```

### Responsive Design

Components should handle mobile/desktop layouts:

- **Desktop**: Sidebar visible, content fills remaining space
- **Mobile**: Sidebar hidden, mobile header with drawer menu

```typescript
// Layout structure
<div className="flex min-h-screen">
  <Sidebar className="hidden md:flex" />
  <MobileHeader className="md:hidden" />
  <main className="flex-1 pt-16 md:pt-0">
    {children}
  </main>
</div>
```

### Styling

Use Tailwind CSS with the `cn()` utility for conditional classes:

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />
```

shadcn/ui components use CSS variables for theming (defined in `app/globals.css`).
