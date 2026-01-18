# Components

This document describes the component structure and code patterns used in the application.

## Component Directory Structure

- `components/` - React components
  - `components/ui/` - Reusable UI primitives (Radix UI + shadcn/ui pattern)
  - `components/providers/` - React context providers (AuthProvider, HubProvider)
  - `components/house-prep/` - Feature-specific components for house prep tracker
  - `components/timeline/` - Timeline-related components

## Code Patterns

### Page Components

- Pages use `useHub()` hook to get current hub, show `<HubSetup />` if no hub exists
- Database operations are async - pages handle loading states
- All data tables have `hub_id` foreign key for multi-tenancy

### Forms

- Forms use controlled components with `useState`
- Form components are typically in feature-specific directories (e.g., `components/house-prep/`)

### Data Access

- All database operations go through `lib/supabase/database.ts`
- Pages should handle loading and error states appropriately
- Use the `useHub()` hook to access the current hub context

### Component Organization

- Feature-specific components live in their own directories (e.g., `components/house-prep/`, `components/timeline/`)
- Reusable UI primitives are in `components/ui/`
- Context providers are in `components/providers/`
