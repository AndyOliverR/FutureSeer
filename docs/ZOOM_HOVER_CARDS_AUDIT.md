# Zoom / scale-on-hover cards – overlap audit

Cards that use **hover scale** (e.g. `hover:scale-105`, `whileHover={{ scale: 1.02 }}`) can grow and overlap neighboring cards in grids. This document lists every place in the codebase that uses this pattern so you can fix overlap (e.g. remove scale, use `z-index` + overflow, or use lift-only `y` without scale).

---

## Pages with card grids (high overlap risk)

These pages render **multiple cards in a grid or list** with zoom/scale on hover. When one card scales up, it can cover adjacent cards.

| Page | What scales | Pattern |
|------|----------------|---------|
| **app/remedies/page.tsx** | Many `<Card>` in category grids (gemstones, colors, mantras, mudras, numerology, etc.) | `hover:scale-105` on Card (lines 69, 79, 140, 195, 246, 302, 312, 426–454, 484) |
| **app/tools/page.tsx** | Tool cards in grid (category sections + flat list) | `whileHover={{ y: -8, scale: 1.02 }}` (lines 171, 204) |
| **app/settings/page.tsx** | Section Cards (profile, subscription, etc.) | `hover:scale-105` on Card (lines 107, 188, 305, 406, 447, 496, 520) |
| **app/support/page.tsx** | Support option blocks | `hover:scale-105` on divs (lines 35, 55) |
| **app/notes/page.tsx** | Note cards / items in list | `whileHover` scale 1.05, 1.02, 1.1 (lines 153, 200, 207, 215, 276, 287, 301) |
| **app/admin/feedback/page.tsx** | Feedback cards | `hover:scale-[1.01]` (lines 117, 125) |

---

## Tool pages with motion cards (grid or list)

Tool pages that use **Framer Motion** `whileHover={{ scale: ... }}` on card-like elements. In grids, these can overlap neighbors.

| Page | Location / context |
|------|---------------------|
| **app/tools/synastry/page.tsx** | scale 1.02, 1.05 on cards (289, 299, 335, 366, 461) |
| **app/tools/financial-astrology/page.tsx** | 1.05, 1.02 (177, 234) |
| **app/tools/psychological-astrology/page.tsx** | 1.05, 1.02 (84, 136) |
| **app/tools/kabbalistic-astrology/page.tsx** | 1.05, 1.02 (84, 126) |
| **app/tools/vedic/page.tsx** | 1.02 (300) |
| **app/tools/daily-decisions/page.tsx** | 1.02 (259) |
| **app/tools/pendulum/page.tsx** | 1.05 (148, 223, 235) |
| **app/tools/esoteric-astrology/page.tsx** | 1.05, 1.02 (79, 124) |
| **app/tools/geomancy/page.tsx** | 1.02, 1.05 (95, 105, 131) |
| **app/tools/western-astrology/page.tsx** | 1.02, 1.05, 1.1 (271, 389, 828, 837) |
| **app/tools/horary-astrology/page.tsx** | 1.05 (458, 469, 550) |
| **app/tools/face-reading/page.tsx** | 1.05, 1.02 (134, 146, 251, 261) |
| **app/tools/dream-symbols/page.tsx** | 1.05 (184) |
| **app/tools/angel-numbers/page.tsx** | 1.05, y: -2 (120) |
| **app/tools/scrying/page.tsx** | 1.02 (97) |
| **app/tools/bibliomancy/page.tsx** | 1.02 (82) |
| **app/tools/shamanic-astrology/page.tsx** | 1.05, 1.02 (85, 144) |
| **app/tools/ziwei-dou-shu/page.tsx** | 1.05, 1.02 (83, 125) |
| **app/tools/hermetic-astrology/page.tsx** | 1.05, 1.02 (86, 131) |
| **app/tools/tarot/page.tsx** | 1.02, 1.05 in several places (203, 333, 404, 427, 513, 526, 540, 619, 643, 933, 991, 1059, 1122) |
| **app/tools/13-signs-zodiac/page.tsx** | 1.05 (150) |
| **app/tools/kp-astrology/page.tsx** | 1.02 (1015) |
| **app/tools/iching/page.tsx** | 1.02, 1.05, 0.95 (376–388, 414–415) |

---

## Other app pages (single cards or buttons)

Scale used on single elements (less overlap risk, but listed for completeness):

| Page | Element |
|------|---------|
| app/disclaimer/page.tsx | Card `hover:scale-105` (19) |
| app/subscribe/page.tsx | Card/block `hover:scale-105` (143) |
| app/error.tsx | Button `hover:scale-105` (28) |
| app/not-found.tsx | Button `hover:scale-105` (15) |
| app/pricing/page.tsx | Logo link `hover:scale-105` (39) |

---

## Components with scale-on-hover cards

These components are used on one or more pages; if they render inside a grid, they can contribute to overlap.

| Component | Usage |
|-----------|--------|
| **components/InnovationInvitation.tsx** | Card + inner divs `hover:scale-105` (19, 30, 36, 42, 48) |
| **components/ReferralCodeCard.tsx** | Cards and buttons `hover:scale-105` (152, 161, 174, 198, 207, 219, 223, 233, 242, 250) |
| **components/PowerUserBenefits.tsx** | Cards `hover:scale-105` (62, 81) |
| **components/TipJarCard.tsx** | Card `hover:scale-105` (26) |
| **components/SubscriptionStatus.tsx** | Cards `hover:scale-105` (88, 107, 124, 143) |
| **components/AttributionLeaderboard.tsx** | Section + cards `hover:scale-105` (16, 33) |
| **components/BaziLuckCycles.tsx** | Card `hover:scale-105` (304) |
| **components/FeedbackImprovement.tsx** | Section/card `hover:scale-105` (41, 61) |
| **components/ContributionTiers.tsx** | Card `hover:scale-105` (160) |
| **components/fengshui/BaguaMap.tsx** | Tiles `whileHover={{ scale: 1.05, zIndex: 10 }}` (68) – uses zIndex to reduce overlap |
| **components/western/CosmicMetricCard.tsx** | `whileHover={{ scale: 1.02 }}` (134) |
| **components/tarot/TarotCardDisplay.tsx** | `whileHover={{ scale: 1.05 }}` (56) |
| **components/angel-numbers/AngelNumbersAnalysis.tsx** | Multiple `whileHover` scale 1.05, 1.1 (105, 128, 139, 161, 173, 185, 197, 287, 298, 309, 342, 379) |
| **components/angel-numbers/AngelNumbersLookupResults.tsx** | `whileHover={{ scale: 1.1, y: -2 }}` (121) |
| **components/DreamSymbolsCoachInterface.tsx** | `whileHover={{ scale: 1.05, y: -5 }}` (130) |
| **components/energy-healing/CrystalRecommendations.tsx** | Card `hover:scale-[1.02]` (73) |
| **components/energy-healing/ChakraVisualization.tsx** | Card `hover:scale-[1.02]` (83) |
| **components/palmistry/MountDashboard.tsx** | `whileHover={{ scale: 1.02, y: -4 }}` (56) |
| **components/palmistry/LineAnalysisCard.tsx** | `whileHover={{ scale: 1.02, y: -4 }}` (38) |
| **components/bazi/BaziDashboardSection.tsx** | `whileHover={{ scale: 1.1, rotate: 5 }}` (98) |
| **components/VedicCoachInterface.tsx** | `whileHover={{ scale: 1.02 }}` (199) |
| **components/admin/SecurityDashboard.tsx** | Card class `hover:scale-[1.01]` (91) |

---

## Summary

- **Remedies page** is the main place with many grid cards using `hover:scale-105`, which matches the overlap you see.
- **app/tools/page.tsx** uses `y: -8` and `scale: 1.02` on tool cards in a grid – same overlap risk.
- **Settings, support, notes, admin feedback** use scale on multiple cards/sections.
- **Many tool pages** use `whileHover` scale on cards or blocks; any that are in a grid can overlap.
- **Shared components** (ReferralCodeCard, PowerUserBenefits, TipJarCard, SubscriptionStatus, InnovationInvitation, etc.) use `hover:scale-105` and can cause overlap wherever they appear in a grid.

**Suggested fix for grid cards:** Prefer **no scale** or only **lift** (e.g. `y: -4` / `translateY`) and add `overflow-hidden` on the grid container, or give the hovered card a higher `z-index` and ensure the grid has enough gap so overlap is minimal. Removing `scale` from grid cards is the most reliable way to avoid overlap.
