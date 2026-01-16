# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

This is a Next.js 14 app (App Router) for planning and tracking a home move. It's a client-side app using localStorage for persistence.

### Key Directories

- `app/` - Next.js App Router pages and routes
  - `app/lib/types.ts` - TypeScript interfaces (Task, Expense, MoveDetails, TimelineEvent)
  - `app/lib/storage.ts` - localStorage CRUD operations for all data types
  - `app/data/` - JSON default data (e.g., house-prep-defaults.json)
- `components/` - React components
  - `components/ui/` - Reusable UI primitives (Radix UI + shadcn/ui pattern)
  - `components/house-prep/` - Feature-specific components for house prep tracker
- `lib/utils.ts` - Utility functions (cn for className merging)

### Data Flow

All data is stored in localStorage with keys prefixed `move-hub-`:
- Tasks and expenses use storage functions from `app/lib/storage.ts`
- Components sync state with localStorage and listen for StorageEvent for cross-tab updates
- Module-level caching is used in some pages to preserve state across navigation

### Styling

- Tailwind CSS with CSS variables for theming (dark/light mode via next-themes)
- Custom colors defined in `tailwind.config.ts` using HSL CSS variables
- The `cn()` utility from `lib/utils.ts` merges Tailwind classes

### Layout Structure

- `app/layout.tsx` - Root layout with ThemeProvider
- `app/layout-client.tsx` - Client-side layout with sidebar (desktop) and mobile navigation
- Responsive design: sidebar hidden on mobile, replaced with slide-out drawer

### Path Aliases

`@/*` maps to the project root (configured in tsconfig.json)
