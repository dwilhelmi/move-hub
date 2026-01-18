# AI Context

This file provides comprehensive guidance for AI assistants working with this codebase.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

This is a Next.js 14 app (App Router) for planning and tracking a home move. It uses Supabase for authentication, database, and multi-user collaboration.

### Key Directories

- `app/` - Next.js App Router pages and routes
  - `app/lib/types.ts` - TypeScript interfaces (Task, Expense, MoveDetails, TimelineEvent, etc.)
  - `app/lib/storage.ts` - Legacy localStorage functions (no longer primary, kept for reference)
  - `app/login/`, `app/signup/` - Authentication pages
  - `app/settings/` - Hub management and member invitations
  - `app/auth/callback/` - OAuth callback handler
- `components/` - React components
  - `components/ui/` - Reusable UI primitives (Radix UI + shadcn/ui pattern)
  - `components/providers/` - React context providers (AuthProvider, HubProvider)
  - `components/house-prep/` - Feature-specific components for house prep tracker
- `lib/supabase/` - Supabase client and database operations
  - `client.ts` - Browser Supabase client
  - `server.ts` - Server Supabase client
  - `database.ts` - CRUD operations for all data types
  - `types.ts` - Database type definitions
- `supabase-schema.sql` - Full database schema (run in Supabase SQL Editor)
- `supabase/migrations/` - Incremental migration files for existing databases
- `middleware.ts` - Route protection and session management

### Data Flow

All data is stored in Supabase PostgreSQL with Row Level Security (RLS):
- Users authenticate via Supabase Auth (email/password)
- Each user belongs to a "hub" (shared move project)
- Multiple users can share the same hub (e.g., spouse)
- RLS policies ensure users only see data for their hub
- Database operations are in `lib/supabase/database.ts`

### Authentication & Authorization

- `AuthProvider` (`components/providers/auth-provider.tsx`) - Manages user session
- `HubProvider` (`components/providers/hub-provider.tsx`) - Manages current hub and members
- `middleware.ts` - Protects routes, redirects unauthenticated users to /login
- Database triggers automatically create profiles on signup and handle invites

### Database Schema

Key tables (see `supabase-schema.sql` for full schema):
- `profiles` - User profiles (extends auth.users)
- `hubs` - Shared move projects
- `hub_members` - Maps users to hubs with roles (owner/member)
- `hub_invites` - Pending invitations for users who haven't signed up
- `tasks`, `expenses`, `timeline_events`, `inventory_items`, `budgets`, `move_details` - App data

Helper functions for RLS:
- `is_hub_member(hub_id)` - Check if current user is a member of a hub
- `is_hub_owner(hub_id)` - Check if current user is an owner of a hub

### Styling

- Tailwind CSS with CSS variables for theming (dark/light mode via next-themes)
- Custom colors defined in `tailwind.config.ts` using HSL CSS variables
- The `cn()` utility from `lib/utils.ts` merges Tailwind classes

### Layout Structure

- `app/layout.tsx` - Root layout with ThemeProvider, AuthProvider, HubProvider
- `app/layout-client.tsx` - Client-side layout with sidebar (desktop) and mobile navigation
- Responsive design: sidebar hidden on mobile, replaced with slide-out drawer
- All pages are dynamically rendered (no static generation) due to auth requirements

### Path Aliases

`@/*` maps to the project root (configured in tsconfig.json)

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## AI Behavior Notes

Guidelines for AI assistants when working on this codebase:

### Git Operations

- **"Save everything"** (or similar phrasing like "save it", "commit and push") means: `git add -A && git commit && git push`
- Do NOT perform git operations for other commands like "generate", "create", "update", etc.
- Always include a `Co-Authored-By` line referencing the agent that is doing the saving

### Database Changes

- Always update `supabase-schema.sql` with the full from-scratch schema
- Also create an incremental migration in `supabase/migrations/` for existing databases
- Use `SECURITY DEFINER` functions for RLS helper functions to avoid recursion
- Test RLS policies carefully - inline subqueries on the same table can cause infinite recursion

### Code Patterns

- Pages use `useHub()` hook to get current hub, show `<HubSetup />` if no hub exists
- Database operations are async - pages handle loading states
- All data tables have `hub_id` foreign key for multi-tenancy
- Forms use controlled components with useState

### Documentation

- Keep this file up to date with any significant changes made
- Add or update other .md files or appropriate documentation alongside any code generation
