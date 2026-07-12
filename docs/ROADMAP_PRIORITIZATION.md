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

## Team archetypes and sprint mix

Product work is not only “engineer vs designer vs PM.” A healthy FutureSeer cadence mixes **five archetypes** (people often span 2–3):

| Archetype | Focus | FutureSeer examples |
|-----------|--------|---------------------|
| **Prototyper (P)** | New ideas; many spikes, few ship | MCP-style Seer tools (P1-11), experimental retention hooks |
| **Builder (B)** | Prototype → production | Stage B queue (P1-1), orchestrator splits, API routes behind flags |
| **Sweeper (S)** | Simplify UI/code; unship; perf | Dual design system compliance (`DESIGN.md`), dedupe Seer paths, ESLint debt |
| **Grower (G)** | PMF iteration | Profile completion UX (P1-9), daily insights (P1-4–P1-6), share card (P2-5) |
| **Maintainer (M)** | Secure, reliable, scalable | Distributed rate limit/circuit (P0-1/P0-2), security audit, cron resume, token caps |

### Stage-appropriate mix

| Product stage | Primary archetypes | FutureSeer (2026) |
|---------------|-------------------|-------------------|
| Pre-PMF / new | P + B + S | Occasional P; most energy on B + M for core loop |
| Growing / PMF forming | B + S + G (+ M) | **Current target:** Builder + Maintainer + Grower |
| Mature / strong PMF | S + G + M (+ B) | Later: more Sweeper + Grower on retention |

### Sprint allocation (solo or small team)

Aim per 2-week slice (adjust when incident):

- **2× Builder/Maintainer** — ship reliability, deploy, fix production fires  
- **1× Grower** — one funnel metric + one UX improvement on sign-up → profile → Seer  
- **0–1× Sweeper** — one simplification (dead code, duplicate route, design drift)  
- **0–1× Prototyper** — time-boxed spike behind env flag; backlog if not shippable  

### Backlog band → archetype hint

When picking from [ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md](./ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md):

- **P0** → mostly **M** (sometimes **B**)  
- **P1 reliability/cost** → **B** + **M**  
- **P1 retention/notifications** → **G** + **B**  
- **P1 Seer quality (P1-7, P1-11)** → **G** + **P** → **B**  
- **P2 differentiation** → **G** + **P**; defer until core loop SEQ is stable  

Agents: bias toward **Maintainer + Builder** when production integrity is at risk; bias toward **Grower** when choosing between a new tool surface and fixing profile generation completion.

## Related

- [HEART_AND_METRICS.md](./HEART_AND_METRICS.md)  
- [FAILURE_TRIAGE.md](./FAILURE_TRIAGE.md)  
- [SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md](./SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md)  
- [ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md](./ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md) — P0/P1/P2 file-level tasks (scale, article alignment)
