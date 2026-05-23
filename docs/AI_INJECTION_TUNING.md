# AI injection classifier tuning (`aiCallEvents`)

The semantic layer in `lib/seerInjectionClassifier.ts` runs after regex checks in `lib/seerInputGuard.ts`. Blocked gate events and stream blocks are written to Firestore **`aiCallEvents`** with optional fields:

| Field | Meaning |
|-------|---------|
| `failureMode` | `prompt_injection` or `gate_block` |
| `guardReason` | Human-readable block reason |
| `injectionScore` | Heuristic score (higher = more suspicious) |
| `injectionReasons` | Tags e.g. `chat_template_marker`, `multiple_role_markers` |

## Runtime threshold

Set in Vercel / `.env.local`:

```bash
INJECTION_BLOCK_SCORE=4   # default; integer 1–20
```

Lower = stricter (more blocks). Higher = looser.

## Firestore queries (console or script)

**Recent semantic blocks (gate):**

```
collection: aiCallEvents
where kind == gate_block
where failureMode == prompt_injection
order by timestamp desc
limit 200
```

**Score distribution (manual):** Export docs and histogram `injectionScore`. Targets:

- Legitimate occult questions should rarely appear with `injectionScore >= threshold`.
- Known jailbreak samples should cluster at `score >= 4`.

**False positives:** If real user questions block with `injectionReasons` containing only `instruction_density`, consider raising threshold to `5` or narrowing patterns in `seerInjectionClassifier.ts`.

**False negatives:** If abuse gets through regex, check whether `injectionScore` was below threshold; add a reason tag or increase weight for that pattern.

## Tuning workflow

1. Deploy with default `INJECTION_BLOCK_SCORE=4`.
2. After 1–2 weeks, query `aiCallEvents` for `gate_block` + `prompt_injection`.
3. Review a sample of blocked `guardReason` / `injectionReasons` vs user reports.
4. Adjust env var or classifier weights; redeploy (no code change needed for env-only tweaks).
5. Re-run unit tests: `pnpm test tests/unit/seerInjectionClassifier.test.ts tests/unit/seerInputGuard.test.ts`.

## Related

- [AGENTS.md](../AGENTS.md) — AI control layer Phases 1–4
- `firestore.rules` — `aiCallEvents` and `_aiCircuitBreaker` are server-only (client deny)
