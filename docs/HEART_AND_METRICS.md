# HEART metrics and lightweight surveys

[HEART](https://uxhints.com/) (Happiness, Engagement, Adoption, Retention, Task success) frames product quality for complex apps. FutureSeer maps it to concrete signals and one **Single Ease Question (SEQ)** touchpoint (standard 7-point ease scale used in UX research).

## HEART mapping

| Dimension | Definition for FutureSeer | Example signals |
|-----------|---------------------------|-----------------|
| **Happiness** | Subjective satisfaction with guidance and UI | SEQ score, qualitative feedback, support sentiment |
| **Engagement** | Depth of use of tools and Seer | Sessions with ≥1 tool view; Seer messages per week |
| **Adoption** | New users reaching value | % completing profile setup → profile → first successful generation |
| **Retention** | Users coming back | Weekly active users with stored `mysticalProfileGenerated` |
| **Task success** | Critical tasks completed without failure | Profile save; mystical generation completes; tool report loads; Seer returns a response |

Use HEART to choose **what to instrument** in analytics (when available); it does not require all five to be fully instrumented on day one.

## SEQ touchpoint (implemented)

**Question:** “Overall, how easy was it to generate your mystical profile?”

**Scale:** 1 = Very difficult … 7 = Very easy (standard SEQ 7-point).

**When:** Shown once after a successful full mystical profile generation, on arrival at Ask the Seer (`/ask-the-seer`), via session flag set in [app/profile/page.tsx](../app/profile/page.tsx). Dismissible (“Not now”) without submitting.

**Storage:** Submissions are written to Firestore collection `seqSubmissions` via [app/api/metrics/seq/route.ts](../app/api/metrics/seq/route.ts).

**Privacy:** Optional `userId` when logged in; no PII beyond what’s needed to correlate with support.

## How to use results

- Track **median SEQ** after UX changes to profile or generation API.  
- Pair low SEQ with **Task success** metrics (generation errors, timeouts) to find friction.  
- Optional later: add a second SEQ after the **first** Main Seer reply—same pattern, different `context` string in the API payload.

## Post-change checks (emotional design and Seer UX)

After changes to branded loading ([MysticalLoadingState](../components/MysticalLoadingState.tsx), [ToolReportGuard](../components/ToolReportGuard.tsx), pilot tools), Main/Tarot Seer empty states, and the optional **streak** banner on [Ask the Seer](../app/ask-the-seer/page.tsx):

1. **SEQ:** Compare median SEQ for the profile-generation flow before/after a release when sample size allows (same question as in `seqSubmissions`).
2. **Task success:** Confirm no increase in `ToolReportGuard` error rates or failed `/api/seer/chat` / `/api/ask-tarot-seer` responses in logs or monitoring.
3. **Qualitative:** Scan support/feedback for “loading,” “confusing,” or “pressure” tied to the streak banner—copy should stay calm and non-guilt.
4. **Optional:** A second SEQ (`context: main_seer_first_reply`) can be added later using the same API pattern as [app/api/metrics/seq/route.ts](../app/api/metrics/seq/route.ts).

## Adoption funnel (pricing and membership)

**Goal:** Measure how often users move from “profile ready, plan needed” toward **Pricing** and checkout. Copy is centralized in [lib/accessGatingCopy.ts](../lib/accessGatingCopy.ts); the profile upgrade CTA posts a PostHog event when configured.

| Step | Signal | Implementation |
|------|--------|----------------|
| Pricing page viewed | Awareness | Existing `PRICING_VIEWED` / page views via [lib/analytics.ts](../lib/analytics.ts) |
| Upgrade from locked profile | Intent | `profile_plan_cta_clicked` (`PROFILE_PLAN_CTA_CLICKED`) with `surface: profile_plan_alert`, `destination`, `layout` |
| Subscription active | Conversion | `user_subscribed`, `subscription_started`, webhooks updating Firestore |

**How to use:** In PostHog (or your analytics UI), build a funnel: page views on `/pricing` → `profile_plan_cta_clicked` → `subscription_started` / active `subscriptionStatus` on `users/{uid}`. Compare before/after UX changes to [app/profile/page.tsx](../app/profile/page.tsx) or pricing copy.

## Related

- [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md)  
- [ROADMAP_PRIORITIZATION.md](./ROADMAP_PRIORITIZATION.md)
