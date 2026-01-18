# Architecture

This document describes the overall architecture of the Move Hub application.

## Overview

This is a Next.js 14 app (App Router) for planning and tracking a home move. It uses Supabase for authentication, database, and multi-user collaboration.

## Key Directories

### Application Structure

- `app/` - Next.js App Router pages and routes
  - `app/lib/types.ts` - TypeScript interfaces (Task, Expense, MoveDetails, TimelineEvent, etc.)
  - `app/lib/storage.ts` - Legacy localStorage functions (no longer primary, kept for reference)
  - `app/login/`, `app/signup/` - Authentication pages
  - `app/settings/` - Hub management and member invitations
  - `app/auth/callback/` - OAuth callback handler
- `lib/supabase/` - Supabase client and database operations
  - `client.ts` - Browser Supabase client
  - `server.ts` - Server Supabase client
  - `database.ts` - CRUD operations for all data types
  - `types.ts` - Database type definitions
- `supabase-schema.sql` - Full database schema (run in Supabase SQL Editor)
- `supabase/migrations/` - Incremental migration files for existing databases
- `middleware.ts` - Route protection and session management

For component structure, see [COMPONENTS.md](./COMPONENTS.md).

## Data Flow

All data is stored in Supabase PostgreSQL with Row Level Security (RLS):
- Users authenticate via Supabase Auth (email/password)
- Each user belongs to a "hub" (shared move project)
- Multiple users can share the same hub (e.g., spouse)
- RLS policies ensure users only see data for their hub
- Database operations are in `lib/supabase/database.ts`

## Authentication & Authorization

- `AuthProvider` (`components/providers/auth-provider.tsx`) - Manages user session
- `HubProvider` (`components/providers/hub-provider.tsx`) - Manages current hub and members
- `middleware.ts` - Protects routes, redirects unauthenticated users to /login
- Database triggers automatically create profiles on signup and handle invites

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
