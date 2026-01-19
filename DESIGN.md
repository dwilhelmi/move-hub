# Design System

This document describes the styling and design patterns used in the application.

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **CSS Variables** - Used for theming (dark/light mode via next-themes)
- **Custom Colors** - Defined in `tailwind.config.ts` using HSL CSS variables
- **Utility Function** - The `cn()` utility from `lib/utils.ts` merges Tailwind classes

## Theming

The application supports dark and light modes through CSS variables defined in `app/globals.css`. Custom color tokens are defined for:
- Primary colors
- Countdown colors
- Progress colors
- Standard UI colors (background, foreground, muted, etc.)

### Dark Mode Best Practices

**CRITICAL: Always use theme-aware classes instead of hardcoded colors**

When styling components, use the semantic color classes that automatically adapt to dark/light mode:

#### Preferred Theme-Aware Classes

Use these classes that adapt to the current theme:
- `bg-background` - Main background color
- `bg-card` - Card background color
- `bg-muted` - Muted/subtle background (e.g., for secondary sections)
- `bg-accent` - Accent background (e.g., for hover states)
- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary/muted text
- `border-border` - Border color
- `bg-primary` / `text-primary` - Primary brand color
- `bg-secondary` / `text-secondary` - Secondary brand color

#### Handling Brand Colors in Dark Mode

For brand colors (like red, green, blue, purple) that need to work in both modes:

**Use Tailwind's dark mode variant:**
```tsx
// Good - Adapts to dark mode
className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"

// Bad - Only works in light mode
className="bg-blue-50 text-blue-700"
```

**Common patterns:**
- Light backgrounds: `bg-{color}-50 dark:bg-{color}-950/30`
- Colored text: `text-{color}-600 dark:text-{color}-400`
- Hover states: `hover:bg-{color}-100 dark:hover:bg-{color}-950/50`

#### What NOT to Do

**Never use hardcoded Tailwind colors** without dark mode variants:
```tsx
// ❌ BAD - Will create white boxes with white text in dark mode
className="bg-white text-slate-900"
className="bg-slate-50 hover:bg-slate-100"
className="bg-gray-100 text-gray-800"

// ✅ GOOD - Adapts to theme
className="bg-card text-foreground"
className="bg-muted hover:bg-accent"
className="bg-muted text-foreground"
```

#### Examples from the Codebase

**Dashboard Quick Actions (app/page.tsx):**
```tsx
// ✅ Correct
className="bg-muted hover:bg-accent border-border hover:border-primary"
```

**Task Cards (components/house-prep/task-card.tsx):**
```tsx
// ✅ Correct - Theme-aware with brand color variants
className={`
  ${isCompleted
    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
    : 'bg-muted/50 dark:bg-muted/30 border-border hover:border-purple-300 dark:hover:border-purple-500'
  }
`}
```

**Inventory Stats (components/inventory/inventory-stats.tsx):**
```tsx
// ✅ Correct - Brand colors with dark variants
{
  color: "text-blue-600 dark:text-blue-400",
  bgColor: "bg-blue-50 dark:bg-blue-950/30"
}
```

## Component Styling

- UI components follow the shadcn/ui pattern
- Components use Tailwind utility classes
- Border radius, spacing, and other design tokens are consistent across components
- Responsive design is handled through Tailwind's responsive prefixes
- **All new components must support dark mode** using the patterns described above
