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

## Component Styling

- UI components follow the shadcn/ui pattern
- Components use Tailwind utility classes
- Border radius, spacing, and other design tokens are consistent across components
- Responsive design is handled through Tailwind's responsive prefixes
