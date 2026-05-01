# FutureSeer UI Quality Checklist

This checklist keeps UI changes polished without breaking stable behavior.

## 1) Design System Boundaries

- Desktop and large screens (`>= 768px`) use Devotionist styling.
- Mobile layout (`< 768px` or native shell) uses Material 3 styling.
- Do not mix Devotionist glass aesthetics with Material 3 surfaces inside the same breakpoint branch.
- Use `useIsMobileLayout()` for component branching; avoid duplicating breakpoint logic.

## 2) Token-First Styling

- Prefer shared tokens over hardcoded palette classes:
  - Surface/background: `bg-surface*`, `bg-surface-container*`
  - Foreground text: `text-surface-on*`
  - Borders: `border-outline*`
  - Primary accents: `bg-primary`, `text-primary`
- Avoid introducing new arbitrary hex values unless there is a documented design requirement.
- Keep gradients limited to intentional hero/callout areas; avoid defaulting entire cards to one-off gradients.

## 3) Spacing, Radius, and Rhythm

- Use consistent spacing scale (`p-4`, `p-6`, `p-8`; `gap-2`, `gap-4`, `gap-6`).
- Maintain predictable corner radii in each system:
  - Material 3 mobile: rounded-xl / rounded-2xl for surfaces.
  - Devotionist web: rounded-2xl / rounded-3xl for primary cards.
- Prefer reusable wrapper patterns over repeated long utility chains.

## 4) Responsive Safety

- Avoid fixed panel heights such as `h-[800px]` for app shells.
- Prefer fluid constraints:
  - `min-h-[60vh]`
  - `max-h-[85vh]`
  - `overflow-hidden` at shell level, internal `overflow-y-auto` where needed.
- For dense tab sets on mobile, prefer horizontal scroll (`overflow-x-auto`) over tightly packed 5-column grids.

## 5) Typography and Readability

- Keep heading hierarchy consistent by page role (hero, section, card title).
- Avoid interactive label text smaller than `text-xs` on mobile.
- Keep body copy at readable contrast against dark backgrounds.
- Preserve existing copy and meaning; only polish readability and hierarchy.

## 6) Touch Targets and Interaction

- Interactive controls should meet at least 44x44 tap area on mobile.
- Ensure icon-only links/buttons have explicit accessible labels.
- Keep focus-visible states obvious on keyboard/touchpad workflows.

## 7) Change Safety Rules

- No deletion of stable working code paths during UI hardening.
- Prefer additive improvements (new utility classes, safer variants, token swaps).
- Validate key flows after UI edits:
  - Sign in / sign up
  - Tools list and tool entry
  - Bottom navigation
  - Footer links and newsletter form
