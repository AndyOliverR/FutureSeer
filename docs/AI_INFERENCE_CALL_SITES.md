# AI inference usage (audit)

Central completion helper: [`lib/aiGateway.ts`](../lib/aiGateway.ts) — `createAICompletion`. It does **not** write to Firestore; keep it free of Firebase Admin so it can be imported from client-side code paths.

**Seer chat** logs successful completions (token counts) to Firestore `aiInferenceEvents` and updates daily totals in `aiInferenceDaily/{userId}` from [`app/api/seer/chat/route.ts`](../app/api/seer/chat/route.ts) after a successful `createAICompletion`, not inside `aiGateway`.

## Seer chat (tiered model + caps)

- Route: [`app/api/seer/chat/route.ts`](../app/api/seer/chat/route.ts)
- Model: [`lib/seerModel.ts`](../lib/seerModel.ts) — free/trial → `openai/gpt-oss-20b` (default), paid plans → `openai/gpt-oss-120b` (default). Llama 3.3 70B / 3.1 8B IDs are aliased. Override with `SEER_CHAT_MODEL` (all tiers), `SEER_CHAT_MODEL_FAST` / `SEER_CHAT_MODEL_FULL`, or `GROQ_TEXT_MODEL` / `GROQ_FAST_TEXT_MODEL`.
- Daily token caps (optional): `SEER_DAILY_TOKEN_CAP_FREE`, `SEER_DAILY_TOKEN_CAP_PAID` (unset = no cap).
- Max output tokens: `SEER_MAX_TOKENS_FREE` (default 400), `SEER_MAX_TOKENS_PAID` (default 500).

## Other `createAICompletion` call sites (no automatic Firestore logging unless extended)

These routes and libraries call `createAICompletion` without server-side usage logging today:

- API routes under `app/api/**` (western, vedic, numerology, tools, openai, medical-seer, tarot-combined-system, etc.)
- Libraries: `lib/akashicRecordsIntelligence.ts`, `lib/sortilegeIntelligence.ts`, `lib/oghamIntelligence.ts`, `lib/mundane/mundaneReportBuilder.ts`, `lib/conversationalMemory.ts`, `lib/vedicInterpretationEnhancer.ts`

Profile generation aggregates LLM usage separately via [`lib/reportGenerationService`](../lib/reportGenerationService.ts) / orchestration and stores runs under `profileGenerationUsage/{uid}/runs/{runId}` from [`app/api/profile/generate-mystical/route.ts`](../app/api/profile/generate-mystical/route.ts).

## Generate-mystical concurrency

- [`lib/generationLock.ts`](../lib/generationLock.ts) — transactional lock with stale recovery (`maxDuration` + 90s).
- Optional headers: `Idempotency-Key` or `X-Idempotency-Key` — duplicate in-flight request returns **202** with `inProgress: true`.
