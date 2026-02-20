# Core stability check — 15 targeted validation questions

Report generated from **router + matrix trace** (no live API/auth). Full end-to-end validation requires running against the API with a real user and reporting response text + confidence.

---

## Q1: Relocation (no personality)

**Query:** Is relocating to Canada favorable for me long-term?

| Field | Result |
|-------|--------|
| Domain | relocation |
| Primary Tool | Astrocartography (relocation + outcome dimension) |
| Confidence | 0.85 |
| Clarification | none |
| Issues | None at router level. Engine must not inject natal personality (enforced via `getUniversalOverviewForSource(sourceName, 'relocation')`). |

---

## Q2: Relocation follow-up (domain lock)

**Query:** Will it be permanent? *(immediately after Q1)*

| Field | Result |
|-------|--------|
| Domain | **general** (router-only) |
| Primary Tool | — |
| Confidence | 0.5 |
| Clarification | **Generic** ("Could you clarify what you'd like to know? For example: timing, career...") |
| Issues | **Relocation is not in topic anchor.** So with router-only, the follow-up is re-classified and hits generic clarify. **Fix:** Add `relocation` to `ANCHORED_INTENTS` and add follow-up patterns (e.g. "permanent", "will it be", "long-term") so "Will it be permanent?" stays in relocation. In the full API, if the route had relocation in topic anchor, it would stay in relocation. |

---

## Q3: Psychological vs predictive

**Query:** Why do I sabotage opportunities right before success?

| Field | Result |
|-------|--------|
| Domain | general (reflective path) |
| Primary Tool | — (no tool; clarification only) |
| Confidence | 0.5 |
| Clarification | **Targeted** ("Are you asking (a) what your chart says about timing and potential, or (b) understanding recurring patterns? For (b), reflective or professional support may help more than predictive tools.") |
| Issues | None. No dates, no dasha, no predictive tools. |

---

## Q4: Relationship routing

**Query:** Is this person my soulmate or a karmic lesson?

| Field | Result |
|-------|--------|
| Domain | relationship |
| Primary Tool | Tarot (relationship) |
| Confidence | 0.9 |
| Clarification | none |
| Issues | None. Correctly relationship, not purpose. |

---

## Q5: Remedy lock (first)

**Query:** Which gemstone should I wear for career growth?

| Field | Result |
|-------|--------|
| Domain | remedies |
| Primary Tool | Vedic Astrology (DEFAULT_CLUSTER; routing matrix has no `remedies` key) |
| Confidence | 0.9 |
| Clarification | none |
| Issues | Matrix does not define a `remedies` routing object; engine still uses Navaratna for gemstones. Router correctly classifies as remedies. |

---

## Q6: Remedy lock (follow-up)

**Query:** Which finger? *(immediately after Q5)*

| Field | Result |
|-------|--------|
| Domain | **general** (router-only) |
| Primary Tool | — |
| Confidence | 0.5 |
| Clarification | **Generic** (router-only) |
| Issues | **Router-only:** "Which finger?" has no remedy keywords, so it is classified as general and gets generic clarify. **In the full API,** the route checks `sessionState.activeTool === 'Navaratna'` and `isNavaratnaSubQuestion(query)` *before* calling the router and forces intent to remedies with context. So in production, Q6 stays in remedy domain. No change needed at router; route-level domain lock is correct. |

---

## Q7: Ambiguity

**Query:** When will it finally happen?

| Field | Result |
|-------|--------|
| Domain | timing |
| Primary Tool | — (clarification) |
| Confidence | 0.5 |
| Clarification | **Targeted** ("When will *what* happen? For example: marriage, job change, move, launch, or something else?") |
| Issues | None. No personality, no random timing, no confidence shown (clarification path). |

---

## Q8: Career timing

**Query:** When will I get promoted?

| Field | Result |
|-------|--------|
| Domain | career |
| Primary Tool | Vedic Dashas (career + timing dimension) |
| Confidence | 0.88 |
| Clarification | none |
| Issues | None. Timing shown from tool; no life-purpose paragraph at router level. |

---

## Q9: Health safety

**Query:** Should I undergo surgery this year?

| Field | Result |
|-------|--------|
| Domain | **timing** (router) |
| Primary Tool | Vedic Dashas / Planetary Transits |
| Confidence | 0.85 |
| Clarification | none |
| Issues | **"Surgery" is not in the health intent patterns.** Router sees "year" and timing keywords and returns timing. Expected domain: health. **Fix:** Add `surgery` (and similar, e.g. "undergo surgery", "surgical") to health triggers in `seerIntentRouter.ts` so this routes to health; engine already has surgery handling and medical disclaimer. |

---

## Q10–Q12: Domain lock stress (purpose chain)

**Q10:** What is my life purpose?  
**Q11:** What obstacles block me?  
**Q12:** When will it manifest?

| Question | Domain | Primary Tool | Clarification | Issues |
|----------|--------|--------------|---------------|--------|
| Q10 | purpose | Kabbalistic Numerology | none | None. |
| Q11 | purpose (topic anchor) | Kabbalistic Numerology | none | None. "obstacles" matches purpose follow-up pattern. |
| Q12 | purpose (topic anchor) | Kabbalistic Numerology | none | None. "manifest" matches purpose follow-up. Timing only on third is engine/response-level; router keeps purpose. |

---

## Q13: Wealth vs relocation conflict

**Query:** Which is better for long-term wealth: Dubai or London?

| Field | Result |
|-------|--------|
| Domain | career (wealth maps to career) |
| Primary Tool | Vedic Astrology (career, null dimension) |
| Confidence | 0.75 |
| Clarification | none |
| Issues | Router gives career (wealth). "Dubai or London" does not match relocation pattern "which (city|country|place|location)" because the pattern expects the word "city" or "country", not proper nouns. So we get career. Engine must not return natal personality as body (scope/relocation-style handling for wealth+location). No generic clarify. |

---

## Q14: Reflective fear split

**Query:** I want to move abroad but I'm scared. Is this fear real or intuitive?

| Field | Result |
|-------|--------|
| Domain | general (reflective) |
| Primary Tool | — |
| Confidence | 0.5 |
| Clarification | **Targeted** (reflective pattern: chart vs patterns / professional support) |
| Issues | None. Reflective pattern matches before relocation; no predictive timing, no natal personality. |

---

## Q15: No hidden timing injection

**Query:** Does my business align with my soul purpose?

| Field | Result |
|-------|--------|
| Domain | purpose |
| Primary Tool | Kabbalistic Numerology |
| Confidence | 0.85 |
| Clarification | none |
| Issues | None. No date, no timing window, no dasha at router level. Route-level check ensures no legacy timing_window for purpose-only questions. |

---

## Summary

| # | Domain correct? | Generic clarify? | Personality / other issues |
|---|-----------------|------------------|----------------------------|
| 1 | Yes | No | No (engine scope relocation) |
| 2 | No (router) | Yes | Relocation not in topic anchor |
| 3 | Yes (general/reflective) | No (targeted) | No |
| 4 | Yes | No | No |
| 5 | Yes | No | No |
| 6 | No (router-only; API fixes) | Yes (router-only) | API keeps remedy lock |
| 7 | Yes | No (targeted) | No |
| 8 | Yes | No | No |
| 9 | No (timing vs health) | No | Add "surgery" to health |
| 10–12 | Yes | No | No |
| 13 | Career (wealth) | No | Engine: no personality as body |
| 14 | Yes (reflective) | No (targeted) | No |
| 15 | Yes | No | No |

**Fixes applied:**

1. **Relocation added to topic anchor** — `ANCHORED_INTENTS` now includes `relocation`; follow-up patterns added for "permanent", "will it be", "favorable", "which city/country", "visa", "migration", "settle". Q2 ("Will it be permanent?") now stays in relocation when previous turn was relocation.
2. **Health triggers for surgery** — Intent router now matches "surgery", "surgical", "undergo surgery", "operation" to health. Q9 ("Should I undergo surgery this year?") now routes to health; engine already attaches medical disclaimer and no diagnosis.

Re-run the 15 via the API and report back with actual response text and confidence for full end-to-end validation.

---

## Running the 15-question API validation

Use the script that calls the real Seer API and prints the compact report:

1. **Start the dev server:** `pnpm dev`
2. **Use a user that has profile + comprehensive profile** (visit `/profile` to generate if needed).
3. **Run:**

   ```bash
   BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=<your-user-id> pnpm run test:core-stability
   ```

   Or with ts-node directly:

   ```bash
   BASE_URL=http://localhost:3000 SEER_TEST_USER_ID=<your-user-id> npx ts-node tests/runCoreStabilityCheck.ts
   ```

4. **Interpret:** 12+ clean (no unwanted personality, no generic clarify, no repeated paragraph where not expected) → stable. 5+ failures → legacy still leaking.
