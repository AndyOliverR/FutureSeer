# FutureSeer DESIGN.md

Version: 1.0  
Status: Production baseline (aligned to current working UI)  
Scope: Next.js web app with dual design system behavior

## 1) Why This Exists

FutureSeer uses two visual systems intentionally:

- Devotionist Web for desktop and large screens (cosmic, translucent, serif-led).
- Material 3 Mobile for small screens and native-like mobile layouts (solid surfaces, ergonomic spacing, touch-first).

This file is the canonical design contract for humans and AI agents. It defines:

- semantic token roles,
- typography and container rules,
- component behavior constraints,
- responsive/accessibility guardrails.

This spec must preserve stable working behavior. Changes should be additive and non-destructive.

## 2) Platform and Design-System Selection

### Breakpoints

- `md` breakpoint: `768px`
- Mobile layout: `< 768px`
- Web layout: `>= 768px`

### Runtime Signals

- `platform-web` class => web layout
- `platform-android` class => mobile layout (name means mobile layout, not Android-only OS)
- `data-platform`: `web | android`
- `data-mobile-os`: `desktop | ios | android`
- `data-design-system`: `devotionist | material | konsta-ios`

Selection timing note:

- Pre-hydration (`app/layout.tsx` inline script): initializes platform/design-system from viewport width and user-agent for first paint stability.
- Post-hydration (`PlatformClassProvider` + `DesignSystemSync`): reconciles and keeps attributes/classes in sync during runtime (resize/orientation/auth-context updates).

### Design-System Intent

- Desktop/laptop: default to `devotionist` (or `konsta-ios` on macOS/Apple-sign-in routes where configured)
- Mobile layout: `material` by default, `konsta-ios` on iOS where configured
- Native runtime nuance: Capacitor/native detection is finalized post-hydration by platform sync providers.

## 3) Token Roles (Semantic, Not Raw Values)

Use role tokens, not one-off hardcoded colors.

### Core brand roles

- `brand.deepSpace` => `--bg-deep-space` (`#020617`)
- `brand.deepSpaceDark` => `--bg-deep-space-dark` (`#010409`)
- `brand.primaryGold` => `--gold-primary` (`#fbbf24`)
- `brand.goldGlow` => `--gold-glow` (`rgba(251, 191, 36, 0.5)`)
- `brand.glassyDeepGradient` => `--bg-glassy-deep`

### Surface roles

- `surface.base` => `--m3-surface`
- `surface.dim` => `--m3-surface-dim`
- `surface.container.low` => `--m3-surface-container-low`
- `surface.container.default` => `--m3-surface-container`
- `surface.container.high` => `--m3-surface-container-high`
- `surface.container.highest` => `--m3-surface-container-highest`

### Text roles

- `text.onSurface` => `--m3-on-surface`
- `text.onSurfaceVariant` => `--m3-on-surface-variant`
- `text.onPrimary` => `--m3-on-primary`
- `text.onPrimaryContainer` => `--m3-on-primary-container`

### Border/outline roles

- `outline.default` => `--m3-outline`
- `outline.variant` => `--m3-outline-variant`

### Tailwind token mappings (required)

Prefer mapped classes:

- backgrounds: `bg-surface`, `bg-surface-container-low`, `bg-surface-container-high`
- text: `text-surface-on`, `text-surface-on-variant`
- borders: `border-outline`, `border-outline-variant`
- brand primary: `bg-primary`, `text-primary`, `text-primary-foreground`

Avoid introducing arbitrary hex unless absolutely required by a documented exception.

## 4) Typography Roles

### Font families

- Base body/UI: `Inter` (`font-sans`)
- Headings/sacred titles: `Cinzel` (`font-heading`, `font-sacred-heading`)
- Sacred body/long-form mystical copy: `Cormorant Garamond` (`font-sacred-body`)

### Heading behavior

- Global headings (`h1-h4`) use `Cinzel`, uppercase, gold, tracking emphasis.
- Web headings: lighter weight and wider tracking.
- Mobile headings: slightly bolder and tighter tracking for legibility.

### Reusable typography utilities

- `fs-heading-hero`: `text-3xl md:text-5xl`, heading style
- `fs-heading-section`: `text-lg md:text-2xl`, heading style
- `fs-meta-text`: `text-xs tracking-wide`

## 5) Spacing, Radius, and Containers

### Radius system

- `rounded-xl` and `rounded-2xl` for primary interactive surfaces.
- Material 3 extended radii available in theme:
  - `xl: 28px`
  - `2xl: 32px`

### Spacing rhythm

- Preferred spacing units: 4/6/8 for pad and 2/4/6 for gaps.
- Keep consistency per page section; avoid large one-off spacing jumps.

### Container/surface behavior

- Use tokenized containers for cards/forms/panels.
- Devotionist glass usage is allowed on web shells where already established.
- Avoid mixing solid Material 3 and glass Devotionist styles in the same breakpoint branch unless explicitly intentional.

## 6) Component Rules (Current Stable Contracts)

### Button

- Primary variants are token-driven (`default`, `filled`, `filled-tonal`, `outlined`, `text`).
- Size system enforces touch safety; `default` and icon buttons meet min 44px target.
- `glass` variant exists for Devotionist contexts; do not use as a default mobile button style.

### Card

- Default card is tokenized: `bg-surface-container`, `border-outline-variant`, text on-surface.
- Elevation levels should use existing `m3-elevation-*` classes.

### Input

- Input uses tokenized surface/border/text.
- Keep focus ring and border transitions for visible interaction affordance.

### Select

- Select content/items should remain tokenized for dark-mode consistency.
- Do not force light popovers in dark routes.

### Bottom Navigation (mobile only)

- Visible only in mobile layout via platform guards.
- Labels should be at least `text-xs`.
- Tap targets must meet 44x44 minimum (`fs-touch-target`).

### Footer

- Compact text must remain readable (avoid sub-10px for key legal/meta copy).
- Icon links require 44x44 touch-safe hit area.

## 7) Responsive Rules

- Mobile-first behavior for narrow layouts.
- For dense tabs on mobile, use horizontal scrolling over cramped fixed grids.
- Avoid rigid fixed-height shells like `h-[800px]` in primary content panes.
- Prefer fluid constraints:
  - `min-h-[60vh]`
  - `max-h-[85vh]`
  - content-specific internal scroll where needed.

## 8) Accessibility Rules

- Keep primary contrast readable on dark surfaces.
- Keep focus-visible states enabled for keyboard users.
- Maintain minimum tap target of 44x44 for interactive controls.
- Icon-only controls must include `aria-label`.

## 9) Do/Don't Guidance for AI Agents

### Do

- Reuse token classes and existing component variants.
- Keep existing behavior and structure intact when applying visual polish.
- Use `useIsMobileLayout()` for layout branching.
- Apply additive improvements in small, verifiable steps.

### Don't

- Don’t delete stable code to force stylistic cleanup.
- Don’t introduce random gradients/palette islands outside defined brand roles.
- Don’t mix Devotionist and Material 3 patterns in one breakpoint branch unintentionally.
- Don’t add fixed-height UI hacks where fluid constraints solve responsiveness.

## 10) Validation Workflow

Run these checks after design-affecting changes:

- `pnpm lint`
- `pnpm run ui:audit:tokens`

Manual QA checklist:

- `/signin`, `/signup`, `/tools`, and representative tool pages
- breakpoints: `<768`, `768-1023`, `>=1024`
- verify contrast, heading hierarchy, touch targets, focus visibility

## 11) Change Management

- This file is a living contract.
- Update it only when token roles, component contracts, or responsive rules change intentionally.
- Any update must preserve existing stable user flows.
