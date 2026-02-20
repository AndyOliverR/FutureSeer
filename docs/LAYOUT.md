# Layout Conventions

## Flex vs Grid

- **Use Grid** when you have multiple columns or rows of content: card grids, form columns, side-by-side panels. Use responsive column steps: `grid-cols-1 sm:grid-cols-2` or `md:grid-cols-*`, with consistent gaps (e.g. `gap-3 sm:gap-4`).
- **Use Flex** when you need single-axis alignment: nav bars, inline buttons, vertical stacks, or wrapping flows (tags/chips). Add `min-w-0` on flex children that scroll or contain long content so they can shrink and avoid overflow.
- Do not use flex with fixed-width children to simulate a 2D grid; use CSS Grid instead for card/content grids.

## Breakpoint Strategy

We use **Tailwind’s default breakpoints** as the single source of truth:

| Prefix | Min width |
|--------|-----------|
| (none) | 0px       |
| `sm:`  | 640px     |
| `md:`  | 768px     |
| `lg:`  | 1024px    |
| `xl:`  | 1280px    |
| `2xl:` | 1536px    |

- Prefer Tailwind responsive prefixes in components (`sm:`, `md:`, etc.). In `globals.css`, `@media (max-width: 768px)` is equivalent to “below `md`” and is used only for global, component-agnostic rules (e.g. starfield, tap targets); it must not override utility-driven layout (e.g. grid columns).

## Absolute / Fixed Positioning

- **Keep** absolute/fixed for: modals, dialogs, dropdowns, tooltips, loading overlays, and decorative overlays that sit above content.
- **Avoid** absolute for layout (e.g. icon inside an input). Prefer flex wrappers and padding (e.g. `flex items-center`, input with `pl-10`) so layout stays in flow.
