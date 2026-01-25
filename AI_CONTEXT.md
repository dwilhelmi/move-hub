# AI Context

This file provides comprehensive guidance for AI assistants working with this codebase.

## Documentation Structure

This project's documentation is organized into focused files:

- @./ARCHITECTURE.md - System architecture, data flow, authentication, database schema, and layout structure
- @./COMPONENTS.md - Component structure and code patterns
- @./DESIGN.md - Styling system and design patterns
- @./CONFIG.md - Configuration, commands, and environment setup

Please read these files for detailed information about the codebase.

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

See [COMPONENTS.md](./COMPONENTS.md) for detailed code patterns. Key points:
- Pages use `useHub()` hook to get current hub, show `<HubSetup />` if no hub exists
- **CRITICAL**: Always use `useDataProvider()` for data access - never import database functions directly
- Data provider automatically switches between database (authenticated) and localStorage (guest)
- Database operations are async - pages handle loading states
- All data tables have `hub_id` foreign key for multi-tenancy
- Forms use controlled components with useState

### Guest Mode

The app supports guest mode for unauthenticated users:
- Guests get auto-generated UUID stored in localStorage
- All data stored in localStorage (scoped by guest UUID)
- Guest data automatically migrated to database on signup
- UI shows guest indicators and encourages signup
- Member management disabled for guests (solo use only)

Key files:
- `components/providers/auth-provider.tsx` - Guest session management
- `components/providers/data-provider-provider.tsx` - Storage mode switching
- `lib/data/local-provider.ts` - localStorage implementation
- `lib/data/database-provider.ts` - Database implementation
- `lib/data/migration.ts` - Guest-to-authenticated migration
- `components/guest-save-prompt.tsx` - Activity-based signup prompt

### Testing

Always write tests when making code changes:

- **Bug fixes**: Write a test that reproduces the bug, then fix it
- **New features**: Write tests for new components, utilities, and integrations
- **Run tests**: Use `npm run test:run` to verify all tests pass before committing

Test file locations:
- `tests/unit/` - Pure functions, utilities, row converters
- `tests/components/` - React component tests (rendering, interactions)
- `tests/integration/` - Provider tests, multi-component flows

Testing stack:
- **Vitest** - Test runner with `npm test` (watch) or `npm run test:run` (single run)
- **React Testing Library** - Component testing
- **happy-dom** - DOM environment (used instead of jsdom for ESM compatibility)

Key patterns:
- Mock Supabase client in `tests/__mocks__/supabase.ts`
- Global mocks (ResizeObserver, matchMedia, pointer capture) in `tests/setup.ts`
- For Radix UI Select components, focus on render tests; use E2E for interactions

### Documentation

- Keep documentation files up to date with any significant changes made
- Add or update appropriate documentation files alongside any code generation
- When adding new features, update relevant documentation files (ARCHITECTURE.md, COMPONENTS.md, etc.)

### Other

- Don't run `npm run build` to verify unless I explicitly say I am not running the server locally