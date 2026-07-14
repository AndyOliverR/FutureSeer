# Performance Architecture (Source of Truth)

Cursor agents and humans should follow these patterns when changing UI, routing, or data loading. Goal: **fast mobile first paint**, **no feature deletion**, **lazy load dormant code**.

## Critical path (what loads on every route)

```
app/layout.tsx
  → lib/fonts.ts (next/font, no Google @import)
  → ClientProviders (Auth + Konsta + MysticalProfile context shell)
  → Header / TopNavBar (no framer-motion on shell)
  → DeferredLayoutComponents (widgets, bottom nav, onboarding, analytics)
```

**Rule:** New global UI must go through `components/DeferredLayoutComponents.tsx` unless it is required for first paint (header, main content shell).

## Fonts

| File | Role |
|------|------|
| `lib/fonts.ts` | `Inter`, `Cinzel`, `Cormorant_Garamond` via `next/font/google` |
| `app/layout.tsx` | Applies `fontClassNames` on `<html>` |
| `app/globals.css` | Uses `var(--font-inter)`, `var(--font-cinzel)`, `var(--font-cormorant)` |

Do **not** add `@import url('https://fonts.googleapis.com/...')` to CSS.

## Platform & design system

| Layer | Responsibility |
|-------|----------------|
| Inline script in `app/layout.tsx` | First-paint `platform-android` / `platform-web` + baseline `data-design-system` (FOUC guard) |
| `lib/applyPlatformToDocument.ts` | Single source for DOM updates after hydration |
| `PlatformClassProvider` | Resize/orientation → platform class |
| `DesignSystemSync` | Auth-aware design system (Apple ID → `konsta-ios`) |

Do not duplicate platform logic in new components; call `getClientPlatformSnapshot()` or `useIsMobileLayout()`.

## Deferred shell components

All defined in `components/DeferredLayoutComponents.tsx`:

- `DeferredFloatingTipJar`, `DeferredMysticalFeedback`
- `DeferredOnboardingTour`, `DeferredBottomNavBar`
- `DeferredAnalyticsInitializer`, `DeferredViewportHeightSync`

Use `dynamic(..., { ssr: false, loading: () => null })` for non-critical chrome.

## Mystical profile Firestore gate

| File | Role |
|------|------|
| `lib/mysticalProfileRouteGate.ts` | `shouldSubscribeMysticalProfile(pathname)` |
| `contexts/MysticalProfileContext.tsx` | Skips `fetchProfile` + `onSnapshot` on marketing/legal routes |

Context remains mounted (consumers keep working); subscription starts when user navigates to `/`, `/tools`, `/profile`, etc.

Extend `PREFIX_ROUTES` / `EXACT_ROUTES` when a new route needs live profile data.

## Mobile GPU & layout

CSS utilities in `app/globals.css`:

| Class | Use |
|-------|-----|
| `fs-mobile-solid-nav` | Top nav: solid surface on mobile, blur only `md+` |
| `fs-mobile-solid-card` | Landing cards: no `backdrop-blur` on mobile |
| `fs-below-fold-section` | `content-visibility: auto` for below-fold blocks |
| `fs-heading-hero` / `fs-heading-section` | Responsive typography tokens |
| `fs-touch-target` | 44×44 minimum tap area |

**Rule:** No `backdrop-blur` on mobile shell (nav, tab bar, landing cards). Desktop Devotionist glass may use blur at `md+`.

## Tool route code splitting

| File | Role |
|------|------|
| `lib/lazyToolImports.ts` | Dynamic import factories for heavy report viewers |
| `components/tools/DeferredToolReport.tsx` | Wrapper for lazy report sections |
| `app/tools/ToolsLayoutShell.tsx` | Shared M3 mobile overrides via `data-tools-layout="true"` |

**Pattern for tool pages:**

```tsx
import dynamic from "next/dynamic";
import { lazyTarotSeerChat } from "@/lib/lazyToolImports";

const TarotSeerChatInterface = dynamic(lazyTarotSeerChat, { ssr: false, loading: () => null });
```

Add new loaders to `lazyToolImports.ts`; do not sync-import large chart/chat components in `page.tsx`.

**Rolled out:** `tarot`, `vedic`, `kp-astrology`, `western-astrology` (Seer chats, chart viewers, dashboard panels).

## Public images (WebP)

| File | Role |
|------|------|
| `lib/publicImagePath.ts` | `publicImageSources(pngPath)` → `{ webp, png }` |
| `components/ui/OptimizedPublicImage.tsx` | `next/image` + optional WebP `<picture>` |

PNG assets are **not deleted**. Generate WebP siblings offline:

```bash
node scripts/generate-public-webp.mjs
```

Browsers use WebP when present; `<img src="*.png">` remains fallback.

## Landing page

`app/page.tsx`:

- Hero sync (LCP)
- Below-fold sections `dynamic()` imported
- Wrapper `fs-below-fold-section` for `content-visibility`

## What we do not do

- Delete feature routes, tool logic, or dormant packages
- Remove `framer-motion` from tool innards in one sweep (shell only optimized first)
- Block render with external font CSS

## Verification

After performance changes:

```bash
npx eslint lib/fonts.ts lib/applyPlatformToDocument.ts lib/mysticalProfileRouteGate.ts components/DeferredLayoutComponents.tsx app/layout.tsx
pnpm test -- --testPathPattern=mysticalProfileRouteGate  # if tests added
```

Manual: mobile viewport 375px — landing, `/tools/tarot`, `/signin` (no Firestore profile subscription in Network tab).
