# Adjust 2026 mobile trends — summary, takeaways, and FutureSeer codebase alignment

Internal synthesis for product and growth planning. It distills themes from Adjust’s *Mobile app trends: 2026 edition* (global app performance benchmark; installs, sessions, retention, CPI, paid/organic mix, ATT, cross-channel measurement). For the vendor’s full report and methodology, see [adjust.com](https://www.adjust.com).

---

## What the report is

An **Adjust** industry benchmark (aggregated app data roughly Jan 2024–Jan 2026) focused on **performance marketing**: installs, sessions, retention, CPI, paid/organic mix, partner counts, **ATT opt-in trends**, and **cross-channel / unified measurement**. It frames **2026** as: AI embedded in workflows (not a side experiment), **multi-platform journeys** (web ↔ app ↔ CTV), and **culture/participation-led discovery** rather than linear funnels. Vertical deep dives cover **gaming**, **e-commerce**, and **finance** with regional splits.

---

## Key takeaways for FutureSeer

1. **Growth is measured across surfaces**  
   Users move between mobile web, desktop, in-app, and other channels; **siloed device metrics misallocate budget**. FutureSeer is a **Next.js web app + Capacitor native** shell (see `package.json`, `lib/firebase.ts` `Capacitor.isNativePlatform()`). Product and marketing should design for **one user identity and comparable events** across web and wrapped app—not only mobile-web KPIs.

2. **Decision-ready analytics over vanity dashboards**  
   The report stresses **dynamic views**, **sharp attribution**, and **signal over noise**. This repo uses **PostHog** (`lib/analytics.ts`, `components/AnalyticsInitializer.tsx`, `app/api/posthog/route.ts`) with **funnel-oriented event names** (profile generation, onboarding, paywall, campaigns). Keep events **stable and sparse enough** to drive funnels and cohorts.

3. **First-touch / campaign context at landing**  
   Personalized messaging and channel-specific creative imply **context at entry matters**. The app captures **UTM + ref + landing variant** and persists first-touch in session storage (`lib/campaignAttribution.ts`), merged into PostHog—aligned with **attribution hygiene** and **variant-aware growth** without requiring an MMP.

4. **AI as infrastructure**  
   Adjust describes AI for **querying marketing data**, **predictive segments**, and **GenAI evaluated by outcomes** (creative tests, journeys). FutureSeer’s core product is already **AI-grounded readings** (Ask the Seer, mystical profile generation—see `AGENTS.md`). An optional **internal** parallel: assistants over **usage/support** data (PostHog, tickets), kept separate from occult accuracy requirements.

5. **Retention and session quality**  
   Benchmarks: e.g. flat gaming retention with install growth; e-commerce shorter sessions with more sessions; finance **more sessions** as apps become daily habit. For a multi-tool, content-heavy product, the parallel is **day-one value** (profile generation) and **habit loops** (community, per-tool Seer). **Firestore-backed onboarding** (`hooks/useOnboarding.ts`) and **activity logging** (`hooks/useActivityLogger.ts` → Firestore) support analysis; **D1/D7/D30** views still depend on how you model events in PostHog or queries—see also [ONBOARDING_FUNNEL_DASHBOARD.md](./ONBOARDING_FUNNEL_DASHBOARD.md).

6. **Community and participation**  
   Discovery through **participation and culture** (not interruptions) aligns with the **Community** surface and the dual **Devotionist Web / Material 3 mobile** design system (`AGENTS.md`). Measurement chain: UTM → signup → profile generation → first community action.

7. **Privacy and trust**  
   Rising ATT opt-in and vertical-specific pre-prompt copy imply a **clear value exchange**. `app/privacy/page.tsx` already mentions PostHog; any future **native** attribution (SKAdNetwork, MMP) should stay equally transparent.

---

## Codebase alignment (report theme → repo)

| Report theme | FutureSeer pieces |
|--------------|-------------------|
| Cross-session campaign context | `lib/campaignAttribution.ts`, `components/AnalyticsInitializer.tsx` |
| Product analytics and funnels | `lib/analytics.ts` (`ANALYTICS_EVENTS`: onboarding, paywall, profile generation, campaigns) |
| Multi-platform (web + app) | Capacitor packages, `CAPACITOR_BUILD` in API routes, `lib/firebase.ts` native branches |
| Engagement beyond pageviews | `hooks/useActivityLogger.ts` (`tool_open`, key `page_view` paths) |
| Returning vs new user | `isReturningUser` in `lib/firebase.ts` (auth metadata)—useful for cohorts |

**Gaps vs. a full MMP-style mobile growth stack (informational):** there is no in-repo **Adjust / AppsFlyer / Branch** integration, SKAdNetwork handling, or **deferred deep links** from ad click → store → first open. First-touch is **URL query** on web/wrapped WebView; **in-page** deep links exist (e.g. `app/tools/western-astrology/page.tsx` — `?tab=advanced` and related tab values). Closing the MMP gap is a **product/marketing** decision.

---

## Bottom line

**2026 growth (per the report) ≈ unified measurement + AI-assisted decisions + multi-platform reality + vertical-aware efficiency.** FutureSeer is **well aligned** on **first-touch campaign capture**, **PostHog event vocabulary for core funnels**, **Capacitor shell**, and **community-oriented UX direction**. The main strategic follow-through is to **treat web and Capacitor as one journey** in analytics and campaigns, and to **benchmark internal** activation (profile complete → generate → first tool chat) with the same discipline as external vertical benchmarks.
