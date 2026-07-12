# Engineering backlog — scale, growth, and article alignment

**Source:** Production readiness review vs. [Astrology App Development Challenges](https://www.idiosystech.com/blogs/astrology-app-development-challenges-and-how-to-overcome-them) (Sep 2025) and internal audits.

**How to use:** Work **P0 → P1 → P2** within each band unless security/incident overrides. Pair every item with a verification path from [VERIFICATION_PLANS.md](./VERIFICATION_PLANS.md).

**Related:**

- [SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md](./SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md) — abuse/reliability (update when P0-1/P0-2 done)
- [ROADMAP_PRIORITIZATION.md](./ROADMAP_PRIORITIZATION.md) — impact vs effort framing
- [ASTROLOGY_ENGINE_AUDIT.md](./ASTROLOGY_ENGINE_AUDIT.md) — chart accuracy
- [ORGANIC_GROWTH_ARCHITECTURE.md](./ORGANIC_GROWTH_ARCHITECTURE.md) — distribution, not infra scale

---

## P0 — Production hardening (before viral traffic)

| ID | Task | Why | Primary files | Acceptance criteria |
|----|------|-----|---------------|---------------------|
| **P0-1** | **Enable distributed rate limits in production** | In-memory limits are per serverless instance; abuse/cost risk under spike | `lib/rateLimit.ts`, `lib/rateLimitFirestore.ts`, Vercel env, [DEVELOPER_RUNBOOK.md](./DEVELOPER_RUNBOOK.md) § Distributed controls | `RATE_LIMIT_STORE=firestore` on prod; `GET /api/diagnose` → `distributedControls.mode: firestore`; `_apiRateLimits` docs after traffic |
| **P0-2** | **Enable distributed AI circuit breaker in production** | Prevents Groq spend cascade when provider is down | `lib/aiCircuitBreakerControl.ts`, `lib/aiCircuitBreakerStore.ts`, `lib/distributedControlsStatus.ts`, Vercel env | `AI_CIRCUIT_STORE=firestore` on prod; diagnose shows both stores active; breaker doc in `_aiCircuitBreaker` on forced failures |
| **P0-3** | **Document and verify prod env checklist** | Operators must not rely on tribal knowledge | `docs/DEVELOPER_RUNBOOK.md`, `AGENTS.md`, new subsection in this file § Ops checklist | Single checklist: Firebase Admin, `CRON_SECRET`, `GROQ_API_KEY` / `AI_GATEWAY_API_KEY`, P0-1/P0-2 flags, Razorpay keys; Vercel preview vs production matrix |
| **P0-4** | **Profile generation observability dashboard** | Stage B failures are silent churn drivers | `app/api/profile/generate-mystical/route.ts`, `lib/mysticalStageB.ts`, `lib/generationLock.ts`, `lib/serverErrorLogging.ts`, `lib/adminUserJourney.ts` | Log/metric fields: `failedTools`, lock stale, stage (`stageA`/`final`), duration; admin errors page or script filters `area: mystical-profile` / `generate-mystical` |
| **P0-5** | **Harden mystical profile client load (transient Firestore)** | Mobile Safari background tabs report offline while `navigator.onLine` is true | `contexts/MysticalProfileContext.tsx`, `lib/painLogging.ts`, `lib/errorLogging.ts` | Offline/unavailable errors use benign path; no `profile_load_failed` severity=error for those messages; optional `warn` telemetry with `visibilityState` meta |
| **P0-6** | **Audit all high-cost AI routes for gate parity** | One unauthenticated route = unbounded Groq bill | `app/api/seer/chat/route.ts`, `app/api/ask-the-seer/route.ts`, `app/api/ask-*-seer/route.ts`, `lib/enforceToolSeerGate.ts`, `lib/userApiAuth.ts` | Grep checklist: every `ask-*-seer` uses `enforceToolSeerGate`; main/proxy routes use `verifyUserRequest` + rate limit; document exceptions in `docs/AI_INFERENCE_CALL_SITES.md` |
| **P0-7** | **Firestore indexes for community hot queries** | Missing indexes → fallback scans, timeouts at scale | `app/api/community/attribution/[userId]/route.ts`, `app/api/community/members/[userId]/stats/route.ts`, `firestore.indexes.json` (if present) | Composite indexes deployed; attribution page loads without index warning in logs; [app/community/attribution/page.tsx](../app/community/attribution/page.tsx) partial-data UX unchanged |

### P0 ops checklist (Vercel production)

```text
RATE_LIMIT_STORE=firestore
AI_CIRCUIT_STORE=firestore
FIREBASE_ADMIN_* (3 vars)
GROQ_API_KEY and/or AI_GATEWAY_API_KEY
CRON_SECRET (for /api/cron/*)
RAZORPAY_KEY_* + NEXT_PUBLIC_RAZORPAY_KEY_ID
```

---

## P1 — Reliability, retention, and moderate scale

| ID | Task | Why | Primary files | Acceptance criteria |
|----|------|-----|---------------|---------------------|
| **P1-1** | **Durable queue for mystical Stage B** (implemented) | `maxDuration=300` + `after()` alone is fragile under platform limits | `lib/mysticalStageBQueue.ts`, `lib/mysticalStageBQueuePure.ts`, `app/api/internal/mystical-stage-b/process/route.ts`, `app/api/cron/mystical-stage-b/route.ts`, `vercel.json` cron `*/5 * * * *` | Per-tool `toolTasks` on `generationJobs`; idempotency `profileHash:toolSlug`; worker drains batches; cron + internal POST resume stale/queued jobs |
| **P1-2** | **Per-tool idempotency for generation HTTP calls** | Double-submit duplicates writes and token spend | `lib/profileGenerationOrchestrator.ts`, representative `app/api/tools/*/generate-report/route.ts`, `app/api/*/comprehensive/route.ts` | Same `profileDataHash` + tool slug → skip or return cached report; integration test in `tests/integration/profile-generate.test.ts` |
| **P1-3** | **Reduce redundant Firestore reads on tool pages** | Profile + tool views multiply reads per session | `hooks/use-auth.ts`, `lib/firebase.ts` (`getUserProfile`), tool pages under `app/tools/**/page.tsx`, `contexts/MysticalProfileContext.tsx` | Document hot path; cache user profile in context with TTL; target: one profile read per navigation burst |
| **P1-4** | **Scale daily insights cron (batch + cursor)** | Full `users` collection scan does not scale | `app/api/cron/daily-insights/route.ts`, `lib/notificationEmail.ts`, `lib/firestoreSchemas.ts` | Paginated query (`lastActiveAt`, `dailyInsightsSentAt`); max N emails per run; Vercel cron schedule documented |
| **P1-5** | **Mobile push for daily insights (FCM)** | Article expects push; today email-only + UI prefs | `app/settings/page.tsx`, `lib/firestoreSchemas.ts`, new `lib/pushNotifications.ts`, Capacitor config under `capacitor.config.*`, `app/api/cron/daily-insights/route.ts` | Opt-in stores FCM token on `users/{uid}`; cron sends push when `notificationPreferences.dailyInsights`; fallback to email |
| **P1-6** | **Weekly prediction notification** | Pairs with `weeklyPredictions` pref | `app/api/cron/daily-insights/route.ts` or new `app/api/cron/weekly-insights/route.ts`, `lib/notificationEmail.ts` | Users with `weeklyPredictions: true` receive one digest/week; rate-limited |
| **P1-7** | **Seer quality eval harness (CI)** | Grounded AI is the moat; regressions are reputational | `tests/regressionRunner.ts`, new `tests/seer-eval/*.json` fixtures, `lib/aiStructuredOutput.ts`, per-tool `lib/*SeerPrompts.ts` | Golden Q&A per tool (vedic, tarot, western); CI fails on empty/off-topic or forbidden phrase list from `app/api/seer/chat/route.ts` |
| **P1-8** | **Update SYSTEM_DESIGN gaps doc** | Doc still claims Seer routes lack auth/rate limit | `docs/SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md`, `app/api/seer/chat/route.ts`, `app/api/ask-the-seer/route.ts` | P0 items marked done/remaining; mermaid reflects `verifyUserRequest` + `withRateLimit` |
| **P1-9** | **Generation failure UX contract** | Users must understand partial success | `app/profile/page.tsx`, `lib/profileGenerationOrchestrator.ts` (`failedTools`), `components/ToolReportGuard.tsx` | UI lists failed tools with retry CTA; copy matches API `failedTools` + `report-readiness` states |
| **P1-10** | **Cost guardrails: Seer daily token cap audit** | Paid vs free caps must match product | `lib/aiInferenceUsage.ts`, `app/api/seer/chat/route.ts`, `lib/profileEditQuota.ts` (`isPaidPlan`) | Document caps in `docs/`; alert when p95 tokens/user/day exceeds threshold |

---

## P2 — Differentiation, global reach, and scale phase 2

| ID | Task | Why | Primary files | Acceptance criteria |
|----|------|-----|---------------|---------------------|
| **P2-1** | **Methodology transparency per tool** | Article #1 trust; audit warns copy vs code mismatch | `docs/ASTROLOGY_ENGINE_AUDIT.md`, tool intros `lib/data/toolIntroductions.ts`, `lib/seo/toolIntros.ts`, each `app/tools/*/page.tsx` | Each astrology tool shows house system + ayanamsha + engine badge (Astronomia / Swiss WASM) |
| **P2-2** | **i18n — one full non-English locale** | Article multilingual must-have | `components/I18nProvider.tsx`, `hooks/useSettings.ts`, `next-i18next` config, `public/locales/*`, Seer prompts (optional `locale` in `lib/aiPromptBuilder.ts`) | HI or ES: profile + pricing + one tool + Seer UI strings; language switch in `app/settings/page.tsx` |
| **P2-3** | **Community Q&A (tool-scoped)** | Article forums/Q&A; current community is attribution-first | `app/community/page.tsx`, `app/community/attribution/page.tsx`, `app/api/community/**`, Firestore rules | Threaded posts per tool slug; rate limit; report flow; moderation flag in admin |
| **P2-4** | **Social scheduler (admin OAuth)** | Organic growth doc gap | `docs/ORGANIC_GROWTH_ARCHITECTURE.md`, new `app/api/admin/social-scheduler/` | No password storage; OAuth tokens; schedule posts per strategy doc |
| **P2-5** | **Mystical profile share image export** | Viral loop in growth doc | `components/report-viral/ShareCard.tsx`, `components/ShareAppModal.tsx`, `lib/mysticalProfilePositiveSnippet.ts` | PNG/Web share from profile snippet; PostHog event for share |
| **P2-6** | **Optional human astrologer marketplace** | Article live consultation — only if product pivots | New routes under `app/api/consultations/`, WebRTC provider integration | Out of scope unless PM approves; AI Seer remains default |
| **P2-7** | **Swiss ephemeris metadata alignment** | Legacy routes confuse power users | `app/api/swiss-ephemeris/**`, `app/api/occult/universal/route.ts`, `docs/ASTROLOGY_ENGINE_AUDIT.md` | Response `metadata.engine` consistent; deprecation note on legacy paths |
| **P2-8** | **AR/VR experiential guidance** | Article future trend | — | Research spike only; no production code until core funnel SEQ ≥ target |

---

## Feature matrix (article must-haves → backlog IDs)

| Article feature | Status | Backlog |
|-----------------|--------|---------|
| Accurate personalized charts | Strong | P2-1 |
| Daily horoscope notifications | Email cron exists; push partial | P1-4, P1-5 |
| Live chat/video with astrologers | AI Seer only | P2-6 (optional) |
| Secure payments | Razorpay live | P0-3 |
| AI predictions + compatibility | Strong | P1-7 |
| Push notifications | Prefs only → push | P1-5, P1-6 |
| Community forums/Q&A | Early | P0-7, P2-3 |
| Multilingual | Minimal | P2-2 |

---

## Suggested sprint slices

**Sprint A (1 week):** P0-1, P0-2, P0-3, P0-6  
**Sprint B (1–2 weeks):** P0-4, P0-5, P0-7, P1-8, P1-9  
**Sprint C (2–3 weeks):** P1-1 (design + spike), P1-2, P1-4  
**Sprint D (2 weeks):** P1-5, P1-6, P1-7  

---

## Verification commands (by band)

| Band | Commands |
|------|----------|
| P0 | `pnpm security`; `pnpm test:integration -- profile-generate`; manual Firestore check `_apiRateLimits` |
| P1 | `pnpm test -- aiTextStream aiStructuredOutput`; `pnpm test:integration`; load test profile gen (staging) |
| P2 | `pnpm test:e2e` (smoke); locale snapshot tests when added |

---

*Last updated: 2026-06-02. Update this file when P0 items ship or queue design (P1-1) is decided.*
