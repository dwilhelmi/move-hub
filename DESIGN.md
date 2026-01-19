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

## Responsive Design Best Practices

**CRITICAL: All components must work on mobile devices (320px+) through desktop**

### Breakpoints

Tailwind's default breakpoints are used throughout the application:
- `sm:` - 640px and up (small tablets, landscape phones)
- `md:` - 768px and up (tablets)
- `lg:` - 1024px and up (desktops)
- `xl:` - 1280px and up (large desktops)

### Common Responsive Patterns

#### Text Sizing
Always scale text appropriately for mobile:
```tsx
// ❌ BAD - Fixed size, too large on mobile
className="text-4xl font-bold"

// ✅ GOOD - Responsive sizing
className="text-2xl sm:text-3xl md:text-4xl font-bold"
```

**Standard text size patterns:**
- Page headers: `text-2xl sm:text-3xl font-bold`
- Section headers: `text-lg sm:text-xl font-bold`
- Body text: `text-sm sm:text-base`
- Small labels: `text-xs sm:text-sm`

#### Grid Layouts
Grids should stack on mobile and expand on larger screens:
```tsx
// ❌ BAD - Fixed 3 columns, will be cramped on mobile
className="grid grid-cols-3 gap-4"

// ✅ GOOD - Stacks on mobile, expands on larger screens
className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
```

**Common grid patterns:**
- Stats/cards: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Two-column layout: `grid-cols-1 md:grid-cols-2`
- Countdown/metrics: `grid-cols-2 sm:grid-cols-4`

#### Spacing and Padding
Reduce padding on mobile to maximize content space:
```tsx
// ❌ BAD - Fixed padding, wastes space on mobile
className="p-8"

// ✅ GOOD - Smaller padding on mobile
className="p-6 sm:p-8"
```

**Common spacing patterns:**
- Card padding: `p-6 sm:p-8`
- Gaps in grids: `gap-3 sm:gap-4` or `gap-2 sm:gap-4`
- Element spacing: `gap-3 sm:gap-4 md:gap-6`

#### Flex Layouts
Stack flex layouts on mobile, side-by-side on larger screens:
```tsx
// ❌ BAD - Always horizontal, elements may overflow on mobile
className="flex items-center justify-between"

// ✅ GOOD - Stacks on mobile, horizontal on larger screens
className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
```

**Common flex patterns:**
- Header with button: `flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`
- Form with submit: `flex flex-col sm:flex-row gap-2`
- Filter bar: `flex flex-col sm:flex-row items-start sm:items-center gap-4`

#### Button Widths
Buttons should be full-width on mobile, auto on larger screens:
```tsx
// ❌ BAD - Fixed width, doesn't adapt to mobile
<Button onClick={handler}>
  Submit
</Button>

// ✅ GOOD - Full width on mobile, auto on larger screens
<Button onClick={handler} className="w-full sm:w-auto">
  Submit
</Button>
```

#### Icon and Image Sizing
Scale icons and images appropriately:
```tsx
// ❌ BAD - Fixed size, too large on mobile
className="w-16 h-16"

// ✅ GOOD - Smaller on mobile, larger on desktop
className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
```

### Examples from the Codebase

**Dashboard Welcome Banner (app/page.tsx):**
```tsx
// ✅ Responsive header with padding and text sizing
<CardHeader className="relative p-6 sm:p-8">
  <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
    {hub.name}
  </CardTitle>
  <CardDescription className="text-primary-foreground/90 text-base sm:text-lg">
    Your complete companion for planning and executing your move
  </CardDescription>
</CardHeader>
```

**Moving Countdown (components/moving-countdown.tsx):**
```tsx
// ✅ Grid that stacks on mobile (2 columns), expands on larger screens (4 columns)
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
  <div className="text-2xl sm:text-3xl font-bold">
    {displayValue}
  </div>
</div>
```

**Settings Invite Form (app/settings/page.tsx):**
```tsx
// ✅ Form that stacks on mobile, horizontal on larger screens
<div className="flex flex-col sm:flex-row gap-2">
  <Input className="flex-1" />
  <Button className="sm:w-auto">
    Invite
  </Button>
</div>
```

**Timeline Header (app/timeline/page.tsx):**
```tsx
// ✅ Header with button that stacks on mobile
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Timeline</h1>
    <p className="text-sm sm:text-base">Plan your moving timeline</p>
  </div>
  <Button className="w-full sm:w-auto">
    Add Event
  </Button>
</div>
```

### Testing Responsive Design

When building or modifying components:
1. **Test at 375px width** (iPhone SE, small phones)
2. **Test at 768px width** (iPad portrait, tablets)
3. **Test at 1024px width** (iPad landscape, small laptops)
4. **Test at 1440px+ width** (desktop monitors)

Common issues to watch for:
- Text overflow or wrapping unexpectedly
- Horizontal scrollbars appearing
- Elements overlapping or too cramped
- Buttons or form inputs that are too small to tap (minimum 44x44px hit area)
- Images or icons that are too large and dominate the screen
