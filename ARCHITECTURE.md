# Architecture

This document describes the overall architecture of the Move Hub application.

## Overview

This is a Next.js 14 app (App Router) for planning and tracking a home move. It uses Supabase for authentication, database, and multi-user collaboration. The app supports both authenticated users and guest mode for users who want to try the app without creating an account.

## Key Directories

### Application Structure

- `app/` - Next.js App Router pages and routes
  - `app/lib/types.ts` - TypeScript interfaces (Task, Expense, MoveDetails, TimelineEvent, etc.)
  - `app/login/`, `app/signup/` - Authentication pages
  - `app/settings/` - Hub management and member invitations
  - `app/auth/callback/` - OAuth callback handler
  - `app/api/create-hub/` - Server-side hub creation API
- `lib/supabase/` - Supabase client and database operations
  - `client.ts` - Browser Supabase client
  - `server.ts` - Server Supabase client
  - `database.ts` - CRUD operations for all data types
  - `types.ts` - Database type definitions
- `lib/data/` - Data provider abstraction layer
  - `types.ts` - DataProvider interface
  - `database-provider.ts` - Supabase implementation
  - `local-provider.ts` - localStorage implementation for guests
  - `hooks.ts` - React hooks for data access
  - `migration.ts` - Guest-to-authenticated data migration
- `supabase-schema.sql` - Full database schema (run in Supabase SQL Editor)
- `supabase/migrations/` - Incremental migration files for existing databases
- `middleware.ts` - Route protection (allows both authenticated and guest users)

For component structure, see [COMPONENTS.md](./COMPONENTS.md).

## Data Flow

The app supports two data storage modes:

### Authenticated Mode (Database)
- Data stored in Supabase PostgreSQL with Row Level Security (RLS)
- Users authenticate via Supabase Auth (email/password)
- Each user belongs to a "hub" (shared move project)
- Multiple users can share the same hub (e.g., spouse)
- RLS policies ensure users only see data for their hub
- Database operations via `DatabaseDataProvider` in `lib/data/database-provider.ts`

### Guest Mode (localStorage)
- Data stored in browser localStorage
- No authentication required
- Each guest gets a unique UUID stored in localStorage
- Single-user only (no collaboration)
- Data persists until browser data is cleared
- localStorage operations via `LocalStorageDataProvider` in `lib/data/local-provider.ts`

### Data Provider Abstraction
- Pages use `useDataProvider()` hook to access data
- Provider automatically selected based on authentication state
- Consistent API across both storage modes
- Guest data automatically migrated to database on signup

## Authentication & Authorization

- `AuthProvider` (`components/providers/auth-provider.tsx`) - Manages user session and guest state
  - Auto-generates UUID for guests
  - Tracks `isGuest` state
  - Clears guest data on logout
- `DataProviderProvider` (`components/providers/data-provider-provider.tsx`) - Provides data access
  - Wraps DataProvider based on authentication state
  - Automatically switches between database and localStorage
- `HubProvider` (`components/providers/hub-provider.tsx`) - Manages current hub and members
  - Supports both database hubs and guest hubs (localStorage)
  - Creates synthetic hub structure for guests
- `middleware.ts` - Route protection (allows both authenticated and guest users)
- Database triggers automatically create profiles on signup and handle invites

### Guest-to-Authenticated Migration

When a guest signs up:
1. `app/signup/page.tsx` detects guest data
2. Calls `migrateGuestDataToDatabase()` from `lib/data/migration.ts`
3. Creates new hub in database
4. Migrates all guest data (tasks, expenses, timeline, inventory, budget, move details)
5. Clears guest data from localStorage
6. User continues with their data in the database

## Database Schema

Key tables (see `supabase-schema.sql` for full schema):
- `profiles` - User profiles (extends auth.users)
- `hubs` - Shared move projects
- `hub_members` - Maps users to hubs with roles (owner/member)
- `hub_invites` - Pending invitations for users who haven't signed up
- `tasks`, `expenses`, `timeline_events`, `inventory_items`, `budgets`, `move_details` - App data

### Row Level Security (RLS) Helpers

Helper functions for RLS:
- `is_hub_member(hub_id)` - Check if current user is a member of a hub
- `is_hub_owner(hub_id)` - Check if current user is an owner of a hub

## Layout Structure

- `app/layout.tsx` - Root layout with ThemeProvider, AuthProvider, HubProvider
- `app/layout-client.tsx` - Client-side layout with sidebar (desktop) and mobile navigation
- Responsive design: sidebar hidden on mobile, replaced with slide-out drawer
- All pages are dynamically rendered (no static generation) due to auth requirements
