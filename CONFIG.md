# Configuration

This document describes configuration, commands, and environment setup for the project.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Path Aliases

- `@/*` maps to the project root (configured in `tsconfig.json`)

This allows imports like:
```typescript
import { Button } from "@/components/ui/button"
import { useHub } from "@/components/providers/hub-provider"
```

## Build Configuration

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
