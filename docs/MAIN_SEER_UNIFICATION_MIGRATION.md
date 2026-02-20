# Main Seer Unification Migration Checklist

## Objective

Remove all legacy orchestration logic and migrate to a single execution pipeline:

**seerOrchestrator.ts**

Flow: Classifier → Domain Lock → Tool Executor → Synthesizer → Confidence → Contract → Cache → Telemetry

No parallel engines.

---

## Phase 0 — Pre-migration safety

- [ ] Create new branch: `feature/unified-orchestrator`
- [ ] Freeze production deploys during migration (or use feature flag)
- [ ] Enable structured telemetry logging
- [ ] Snapshot current system behavior (run 25 stress tests)
  - Store: intent detected, domain selected, tools used, confidence %, response text
  - This is your baseline

---

## Phase 1 — Build new orchestrator (without deleting legacy)

- [ ] Create `/lib/seerOrchestrator.ts` (or `/core/orchestrator/seerOrchestrator.ts`)
- [ ] Implement:
  - [ ] normalizeQuery()
  - [ ] cacheKey builder
  - [ ] classifyIntent (Groq or validated pattern router)
  - [ ] validateClassification
  - [ ] resolveDomainLock
  - [ ] executeToolCluster
  - [ ] synthesizeResponse
  - [ ] enforceResponseContract
  - [ ] computeConfidence
  - [ ] telemetry logging
- [ ] Ensure orchestrator returns structured object:
  ```ts
  { answer: string; confidence: number | null; domain: string; intent: string; }
  ```
- [ ] Do NOT connect to production route yet

---

## Phase 2 — Tool executor unification

- [ ] Remove all narrative logic from tool engines
- [ ] Each tool must return structured data only:
  ```ts
  { primary_signal: string; supporting_signals: string[]; timing_data: string | null; agreement_score: number; data_completeness: number; }
  ```
- [ ] Remove any tool that returns pre-written paragraphs
- [ ] Remove universal overview functions (search and eliminate):
  - getUniversalOverview
  - legacyOverview
  - autoNatalSummary
  - implicit personality injection

---

## Phase 3 — Remove legacy timing logic

- [ ] Search and delete: legacy timing_window injection, automatic date scoring outside toolExecutor, hidden dasha date injection in route
- [ ] Timing must only occur when: `intent.requires_timing === true`

---

## Phase 4 — Remove fallbacks

- [ ] Search and delete:
  - "Ask me about your future…"
  - Generic "Could you clarify what you'd like to know?" (keep only targeted clarifications)
  - "This builds on what we saw…"
  - Generic natal personality fallback
  - Catch-all response builders
- [ ] Replace with targetedClarification() only

---

## Phase 5 — Route migration

In `/app/api/seer/query/route.ts`:

- [ ] Replace legacy engine call with:
  ```ts
  const result = await runMainSeer({ query, userProfile, sessionState });
  ```
- [ ] Remove any post-processing after orchestrator call (no dual verdict building, no secondary modifications)

---

## Phase 6 — Confidence engine check

- [ ] Confirm confidence is computed only in confidenceEngine.ts (or single module)
- [ ] Remove any old % logic: hardcoded 70%, random range confidence, model-generated confidence

---

## Phase 7 — Telemetry validation

For each request confirm logs include:

- classification
- resolved domain
- lock strength
- primary tool
- agreement score
- confidence breakdown
- latency breakdown
- cache hit

- [ ] No silent failures

---

## Phase 8 — Run 25 stress tests again

Validate:

- [ ] Correct domain selection
- [ ] No personality drift in relocation
- [ ] No predictive tools for psychological
- [ ] Remedy lock preserved
- [ ] Timing only when requested
- [ ] No generic clarifications where targeted expected
- [ ] Confidence matches deterministic formula (when implemented)
- [ ] No duplicate paragraph loops

If any fail → fix in new engine only. Do NOT reintroduce legacy patches.

---

## Phase 9 — Delete legacy engine completely

After tests pass:

- [ ] Delete legacy engine files
- [ ] Delete universal overview helpers that inject narrative
- [ ] Delete legacy timing helpers
- [ ] Delete fallback narrative templates
- [ ] Remove unused imports and commented fallback code
- [ ] Search repo for: `legacy`, `universalOverview`, `fallback`, `defaultSeerResponse`, `oldTiming` — remove or refactor

---

## Phase 10 — Final safety check

- [ ] Confirm only one orchestrator entry point exists
- [ ] Confirm no tool generates narrative (only structured data)
- [ ] Confirm no route modifies response post-orchestrator
- [ ] Confirm no secondary confidence generator
- [ ] Confirm no implicit natal fallback

---

## Post-migration monitoring (first 7 days)

Track daily:

- Domain misclassification rate
- Clarification rate
- Tool scope violation count
- Avg confidence by domain
- Cache hit %
- Avg latency
- Repeat question frequency
- Domain switch frequency

If domain switch rate > 20% → classifier tuning required.

---

## Migration success criteria

System is considered unified when:

- All 25 stress tests pass
- No legacy code remains in the response path
- No dual execution paths
- Confidence deterministic (when confidence engine is implemented)
- Domain lock stable
- Telemetry consistent
- Cache working (when implemented)
- Latency < 1.2s avg (target)

---

## What NOT to do

- Do not leave one legacy helper "just in case"
- Do not merge narrative from tools into the main answer outside the synthesizer
- Do not let classifier override domain lock
- Do not patch old code to fix new behavior
- Do not keep silent fallbacks

If even one survives, instability can return.

---

## Final state architecture (target)

```
route.ts
   ↓
seerOrchestrator.ts
   ↓
  ├── groqClassifier.ts (or validated router)
  ├── domainLockEngine.ts
  ├── toolExecutor.ts
  ├── responseSynthesizer.ts
  ├── confidenceEngine.ts
  ├── responseContract.ts
  ├── cacheLayer.ts
  └── telemetry.ts
```

No other execution path allowed for Main Seer response generation.
