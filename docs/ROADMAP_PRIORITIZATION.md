# Roadmap prioritization (Untools-style)

Use [Untools](https://untools.co/)-style thinking to balance **core journey quality** vs. **breadth across 50+ tools** without defaulting to “more AI” for every problem ([Law of the Hammer](https://uxhints.com/)).

## Impact vs. effort (quarterly)

Plot work in two dimensions:

| | **Low effort** | **High effort** |
|---|----------------|-----------------|
| **High impact** | Do first: SEQ-driven copy fixes, `ToolReportGuard` error clarity, auth routing doc parity | Profile generation reliability, cross-tool report consistency |
| **Low impact** | Nice-to-have polish on rarely used surfaces | Full parity of niche tools before core flows are stable |

**Rule of thumb:** Fix **one broken step** in sign-up → profile → generate → tools/Seer before adding surface area to peripheral tools.

## Second-order thinking

Before shipping a feature, ask: **What do users do when the happy path fails?**

Examples aligned with the codebase:

- **Viral / teaser gates** ([ToolReportViralGate](../components/report-viral/ToolReportViralGate.tsx)): If the user hits a lock state, is the next action obvious (e.g. profile, plan, retry)?
- **Community load timeout** ([app/community/attribution/page.tsx](../app/community/attribution/page.tsx)): Partial data + message beats an infinite spinner.
- **Mystical generation**: If some tools fail (`failedTools` in API response), users need a clear story—retry vs. continue—so they don’t assume total failure.

## Cynefin-style triage (bugs vs. design)

| Situation type | Examples | Response |
|----------------|----------|----------|
| **Clear** | 500 on `/api/profile/generate-mystical`, broken redirect | Reproduce, fix, add test |
| **Complicated** | Ephemeris mismatch vs. spec | Expert review + [ASTROLOGY_ENGINE_AUDIT.md](./ASTROLOGY_ENGINE_AUDIT.md) |
| **Complex** | “Community feels empty” | Experiments; no single code fix |
| **Chaotic** | Data loss reports | Stop ship, restore integrity first |

## Ladder of inference (support and copy)

Users may jump from a reading to a fixed life conclusion. Product copy and Seer prompts should encourage **questions grounded in their report** rather than deterministic fortune. Second-order: fewer misinterpretations → fewer angry tickets.

## Confidence vs. speed

AI responses (Groq) favor speed; **chart math and timezones** favor validation. Prefer reusing [lib/birthDateTimeToUTC.ts](../lib/birthDateTimeToUTC.ts) and existing ephemeris modules over quick hacks—see [AGENTS.md](../AGENTS.md) astrology pipeline.

## Related

- [HEART_AND_METRICS.md](./HEART_AND_METRICS.md)  
- [FAILURE_TRIAGE.md](./FAILURE_TRIAGE.md)  
- [SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md](./SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md)
