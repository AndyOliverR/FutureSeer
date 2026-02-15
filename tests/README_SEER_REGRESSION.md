# Main Seer regression tests

Automated structural validation for the 25 stress-test questions.

## Files

- **stressCases.json** — 25 query inputs (no logic).
- **expectedOutcomes.json** — Structural expectations per case (domain, no_personality_dump, no_banned_phrases, etc.).
- **assertionEngine.ts** — Asserts result vs expected (domain, forbidden content, clarification type). No subjective wording checks.
- **regressionRunner.ts** — Runs each case (via API or future `runMainSeer()`), runs assertions, exits 1 on failure.

## Run

**Against live API (dev server):**

```bash
# Start app: npm run dev
BASE_URL=http://localhost:3000 npm run test:seer
```

Optional: `SEER_TEST_TOKEN=<idToken>` for authenticated requests.

**Without BASE_URL:** Runner exits 0 and reminds you to set BASE_URL; stress case and expected outcome files are still in place for when the unified orchestrator is used.

## CI

Gate merges on:

```bash
npm run test:seer
```

Ensure BASE_URL points to a deployed preview or local server in CI.

## Expectations

Assertions are **structural only**: domain, intent, no personality drift, no banned phrases, targeted vs generic clarification, no diagnosis, no timing when not requested. Language variation is allowed; architectural drift is not.

## After unification

When `seerOrchestrator.ts` exists, change the runner to call `runMainSeer({ query, userProfile, sessionState })` instead of fetch so tests run without a live server.
