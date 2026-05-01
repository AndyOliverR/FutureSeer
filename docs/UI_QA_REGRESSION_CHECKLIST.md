# UI QA Regression Checklist

Run this checklist after UI-focused changes.

## Breakpoint Validation

- Mobile (`< 768px`): verify Material 3 layout, bottom nav visibility, readable labels, and touch targets.
- Tablet (`768px - 1023px`): verify no overflow clipping, tabs remain usable, and cards scale cleanly.
- Desktop (`>= 1024px`): verify Devotionist layout, spacing rhythm, and heading hierarchy.

## Core Route Smoke Checks

- `/signin`: OAuth buttons, email sign-in form, and fallback states render correctly.
- `/signup`: age gate, provider buttons, and email path remain usable.
- `/tools`: search, category chips, card navigation, and pending badges are legible.
- Representative tools: chat panes in Ask-the-Seer tabs remain scrollable and not clipped.

## Accessibility Pass

- Text contrast remains readable on dark surfaces.
- Focus indicators are visible for keyboard users.
- Interactive controls meet minimum target size on mobile.
- Icon-only controls include meaningful `aria-label`.

## Guardrail Commands

- `pnpm lint`
- `pnpm ui:audit:tokens`

## Non-Destructive Policy

- No deletion of stable, working logic during UI hardening.
- Prefer token swaps, utility normalization, and additive variants.
