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
| **P1-4** | **Scale daily insights cron (batch + cursor)** | Full `users` collection scan does not scale | `app/api/cron/daily-insights/route.ts`, `lib/cronDailyInsights.ts`, `lib/notificationEmail.ts` | **Shipped:** doc-id pagination + `nextCursor`, `dailyInsightEmailSentAt` dedupe, chart-personalized copy via `buildDailyInsightForEmail`; tune `DAILY_INSIGHTS_BATCH_SIZE`; chain cron if `hasMore` |
| **P1-5** | **Mobile push for daily insights (FCM)** | Article expects push; today email-only + UI prefs | `app/settings/page.tsx`, `lib/firestoreSchemas.ts`, new `lib/pushNotifications.ts`, Capacitor config under `capacitor.config.*`, `app/api/cron/daily-insights/route.ts` | Opt-in stores FCM token on `users/{uid}`; cron sends push when `notificationPreferences.dailyInsights`; fallback to email |
| **P1-6** | **Weekly prediction notification** | Pairs with `weeklyPredictions` pref | `app/api/cron/daily-insights/route.ts` or new `app/api/cron/weekly-insights/route.ts`, `lib/notificationEmail.ts` | Users with `weeklyPredictions: true` receive one digest/week; rate-limited |
| **P1-7** | **Seer quality eval harness (CI)** | Grounded AI is the moat; regressions are reputational | `tests/regressionRunner.ts`, new `tests/seer-eval/*.json` fixtures, `lib/aiStructuredOutput.ts`, per-tool `lib/*SeerPrompts.ts` | Golden Q&A per tool (vedic, tarot, western); CI fails on empty/off-topic or forbidden phrase list from `app/api/seer/chat/route.ts` |
| **P1-8** | **Update SYSTEM_DESIGN gaps doc** | Doc still claims Seer routes lack auth/rate limit | `docs/SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md`, `app/api/seer/chat/route.ts`, `app/api/ask-the-seer/route.ts` | P0 items marked done/remaining; mermaid reflects `verifyUserRequest` + `withRateLimit` |
| **P1-9** | **Generation failure UX contract** | Users must understand partial success | `app/mystical-profile/page.tsx`, `components/mystical/GenerationPartialFailureBanner.tsx`, `lib/generationFailureUx.ts`, `app/api/profile/generate-mystical/route.ts` | **Shipped:** failed-tool banner + API `failedTools`; profile-page retry copy still optional |
| **P1-10** | **Cost guardrails: Seer daily token cap audit** | Paid vs free caps must match product | `lib/aiInferenceUsage.ts`, `app/api/seer/chat/route.ts`, `lib/profileEditQuota.ts` (`isPaidPlan`) | Document caps in `docs/`; alert when p95 tokens/user/day exceeds threshold |
| **P1-11** | **MCP-style tool calling for Main Seer** (spike shipped) | Stuffing full profile into every `/api/seer/chat` prompt is costly; models need on-demand context | `lib/mainSeerTools.ts`, `lib/seerChatWithTools.ts`, `app/api/seer/chat/route.ts`, `env-template.txt` | Opt-in `SEER_MCP_TOOLS=1`; 4 read-only tools (`list_ready_tools`, `get_seer_master_summary`, `get_tool_report`, `search_occult_knowledge`); Groq tool loop max 2 rounds; per-tool Seer routes unchanged |
| **P1-12** | **Quarterly AI security audit (Cloudflare-style skill)** | `pnpm security` + gitleaks catch CVEs/patterns; auth bypass, IDOR, and Seer abuse need adversarial Recon → Hunt → Validate | [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill), `docs/SECURITY_CHECKS.md`, `scripts/security-audit-skill.mjs` | Quarterly (or after major auth/payment changes): run skill on scoped paths below; discovery model ≠ validation model; survivors → P0/P1 backlog; no auto-merge; `pnpm run security:audit:skill` prints cadence + scope |

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
| **P2-10** | **DuckDB eval / ops analytics (offline)** | Firestore is system of record; fleet metrics (p95 tokens/route, gate blocks, `failedTools`) need fast SQL on exports | `scripts/export-ai-call-events.mjs` (or Admin export), `tests/seer-eval/`, optional `pnpm run analytics:duckdb` | Monthly or CI-adjunct script: CSV/Parquet from `aiCallEvents` + generation logs → DuckDB queries documented in `docs/`; pairs with P1-7 and P0-4; **not** in request path |
| **P2-11** | **Optional KV cache (Redis / Vercel KV)** | Firestore-backed `_apiRateLimits` works; hot keys may need lower latency or cost at spike | `lib/rateLimit.ts`, `lib/rateLimitFirestore.ts`, Vercel KV or Upstash env | Only if prod metrics show rate-limit write pressure or p99 API latency from counter reads; feature-flag `RATE_LIMIT_STORE=kv`; Firestore remains fallback; document in [DEVELOPER_RUNBOOK.md](./DEVELOPER_RUNBOOK.md) |

### Data layer map

FutureSeer is a **Firebase + Vercel monolith**. Add specialized stores only when a single job clearly outgrows Firestore — see [KDnuggets: modern database tools](https://www.kdnuggets.com/10-github-repositories-for-modern-database-systems-and-tools) for the general pattern (right tool per workload).

| Workload | Today | When to add | Backlog |
|----------|--------|-------------|---------|
| **System of record** (users, profiles, tool reports) | Firestore | Stay on Firestore unless full platform migration | — |
| **Auth** | Firebase Auth | Stay | — |
| **Distributed rate limit + AI circuit breaker** | Firestore `_apiRateLimits`, `_aiCircuitBreaker` (`RATE_LIMIT_STORE` / `AI_CIRCUIT_STORE`) | Optional **KV/Redis** if hot-path latency or cost bites | P2-11 |
| **AI audit + abuse** | Firestore `aiCallEvents` | **OLAP** (ClickHouse/BigQuery) only if admin aggregates timeout | P0-4, then P2-10 |
| **Seer on-demand context** (not stuffing full profile in prompt) | Firestore reads via Groq tools + `knowledge/` | Extend tool catalog; OpenViking-style hierarchy = design ref only | P1-11 |
| **Seer similar-question cache** | Firestore per-tool caches | KV optional for sub-ms repeat hits | P2-11 (optional) |
| **Generation queue** | Firestore `generationJobs` / Stage B worker | Stay until job volume forces external queue | P1-1 |
| **Offline analytics / eval SQL** | Jest + manual Firestore console | **DuckDB** on exported CSV/Parquet | P2-10, P1-7 |
| **Metrics time-series (Prometheus-style)** | Logs + `aiCallEvents` queries | Vercel log drain or hosted metrics after P0-4 | P0-4 |
| **Postgres / Supabase / MySQL scale** | Not used | Defer — migration cost >> benefit at current stage | — |

**Rule:** Firestore stays the persistence promise for user reports. New layers are **additive** and **ops/eval-only** until product metrics justify them.

---

## Feature matrix (article must-haves → backlog IDs)

Reference: [Idiosys — Astrology app development challenges](https://www.idiosystech.com/blogs/astrology-app-development-challenges-and-how-to-overcome-them) (accuracy, scale, monetization, security, must-have features).

| Article feature | Status | Backlog |
|-----------------|--------|---------|
| Accurate personalized charts | Strong; methodology badges on Vedic/Western (P2-1 lite) | P2-1 (expand to all astro tools) |
| Daily horoscope notifications | Email cron (paginated + chart-personalized); in-app `DailyInsightCard` on home | P1-5 FCM push, P1-6 Android widget |
| Live chat/video with astrologers | AI Seer streaming (per-tool + master) | P2-6 (optional human marketplace) |
| Secure payments | Razorpay live | P0-3 |
| AI predictions + compatibility | Strong (50+ tools + `CompatibilityTab`) | P1-7 eval harness |
| Push notifications | Email + in-app card; prefs stored; no FCM yet | P1-5, P1-6 |
| Community forums/Q&A | Attribution/community early | P0-7, P2-3 |
| Multilingual | Minimal | P2-2 |
| Data security (SSL, privacy, payments) | HTTPS/Vercel, Firebase rules, Razorpay sig, `pnpm security`, P1-12 audit harness | P1-12 quarterly |
| Scalability at traffic spikes | Stage B queue, distributed rate limit/circuit (Firestore) | P2-11 optional KV |
| Partial generation UX | `GenerationPartialFailureBanner` on mystical profile | P1-9 (profile-page retry wiring) |

---

## Suggested sprint slices

**Sprint A (1 week):** P0-1, P0-2, P0-3, P0-6  
**Sprint B (1–2 weeks):** P0-4, P0-5, P0-7, P1-8, P1-9  
**Sprint C (2–3 weeks):** P1-1 (design + spike), P1-2, P1-4  
**Sprint D (2 weeks):** P1-5, P1-6, P1-7, P1-11 (expand tool catalog + metrics)  
**Sprint E (Maintainer slice, quarterly):** P1-12 first run + triage; pair with `pnpm security` monthly

---

## Verification commands (by band)

| Band | Commands |
|------|----------|
| P0 | `pnpm security`; `pnpm test:integration -- profile-generate`; manual Firestore check `_apiRateLimits` |
| P1 | `pnpm test -- aiTextStream aiStructuredOutput`; `pnpm test:integration`; load test profile gen (staging); `pnpm run security:audit:skill` (quarterly AI audit scope) |
| P2 | `pnpm test:e2e` (smoke); locale snapshot tests when added; `pnpm run analytics:duckdb` when P2-10 ships |

---

*Last updated: 2026-07-12. Update this file when P0 items ship, queue design changes, or data-layer decisions are made.*
