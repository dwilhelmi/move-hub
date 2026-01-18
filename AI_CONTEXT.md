# AI Context

This file provides comprehensive guidance for AI assistants working with this codebase.

## Documentation Structure

This project's documentation is organized into focused files:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, data flow, authentication, database schema, and layout structure
- **[COMPONENTS.md](./COMPONENTS.md)** - Component structure and code patterns
- **[DESIGN.md](./DESIGN.md)** - Styling system and design patterns
- **[CONFIG.md](./CONFIG.md)** - Configuration, commands, and environment setup

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
- Database operations are async - pages handle loading states
- All data tables have `hub_id` foreign key for multi-tenancy
- Forms use controlled components with useState

### Documentation

- Keep documentation files up to date with any significant changes made
- Add or update appropriate documentation files alongside any code generation
- When adding new features, update relevant documentation files (ARCHITECTURE.md, COMPONENTS.md, etc.)
