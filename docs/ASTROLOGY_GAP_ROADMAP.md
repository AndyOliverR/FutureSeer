# Astrology gap roadmap

**Purpose:** Prioritize calculation stability vs. competitor feature lists (e.g. AstroApp). FutureSeer does **not** require AstroApp API for production; native engines live under `lib/`.

**Related:** [ASTROLOGY_ENGINE_AUDIT.md](./ASTROLOGY_ENGINE_AUDIT.md) · [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md)

**Last updated:** 2026-07-13

---

## Principles

1. **Computed before narrative** — chart numbers must come from `getChart` / `tropicalCalculator` (or Swiss WASM where enabled), not static tables.
2. **Honest UI** — `AstrologyMethodologyBadge` shows zodiac, houses, and data tier (computed / AI / educational).
3. **No silent mocks in production** — mock transit tables and sine-wave ephemeris are dev-only or removed.
4. **Port math, don’t rent it** — prefer in-repo or OSS algorithms over paid APIs (AstroApp, VedAstro).

---

## P0 — Stability (in progress)

| ID | Task | Status | Files |
|----|------|--------|-------|
| P0-1 | Methodology badges on core chart tools | ✅ Done | `components/astrology/AstrologyMethodologyBadge.tsx`, tool pages |
| P0-2 | Replace mock Western current transits | ✅ Done | `lib/astrology/computedSkyPositions.ts`, `lib/western/transitCalculator.ts`, `astroChartAdapter.ts` |
| P0-3 | Replace static 2025 Vedic transit tables | ✅ Done | `lib/currentTransitService.ts` |
| P0-4 | Remove hardcoded transit fallback in prod | ✅ Done | `lib/futureSeerAstroService.ts` |
| P0-5 | Document gap matrix vs AstroApp | ✅ Done | This file |

---

## P1 — High-value Vedic depth

| ID | Feature | Effort | Approach |
|----|---------|--------|----------|
| P1-1 | **Shadbala / Graha bala** | Medium | Port from [node-jhora analytics](https://github.com/HariEshwar-J-A/node-jhora) or [vedic-astro](https://www.npmjs.com/package/vedic-astro); wire `ShadbalaAnalysis.tsx` |
| P1-2 | **Drishti (Vedic aspects)** | Medium | Parashara 7th-house rules in `lib/vedic/drishti.ts` |
| P1-3 | **Guna Milan / Ashtakoota** | Medium | `lib/vedic/gunaMilan.ts`; finish `compatibilityService` Vedic path |
| P1-4 | **House-system parity audit** | Low | Align Hellenistic whole-sign copy with `hellenisticAstrologyIntelligence` numbers |
| P1-5 | **Parity tests** | Medium | Extend `tests/unit/engine-parity.test.ts` with one canonical chart |

---

## P2 — Western & timing

| ID | Feature | Effort | Notes |
|----|---------|--------|-------|
| P2-1 | Real transit ingress dates | Medium | Step chart or Swiss WASM sign boundaries |
| P2-2 | Solar return API route | Medium | Universal route references missing `/api/swiss-ephemeris/progressions` |
| P2-3 | Swiss `.se1` file ephemeris | High | `public/ephe/` + license review |
| P2-4 | Zodiacal releasing / harmonics | High | Defer unless product promises advanced Western |

---

## P3 — Financial (optional product bet)

| ID | Feature | Effort | Notes |
|----|---------|--------|-------|
| P3-1 | Gann / Sepharial methods | Very high | AstroApp Financial Gold — not in scope unless dedicated SKU |
| P3-2 | Long historical securities DB | High | Licensing + maintenance |
| P3-3 | Current stack polish | Low | Natal wealth + Yahoo overlay is sufficient for MVP |

---

## Explicitly out of scope (vs AstroApp)

- Portal designer / portlet layouts (desktop workstation UX)
- 35 dasha systems / 46 ayanamsas (implement on demand per tool copy)
- Proprietary third-party interpretation packs (Makransky, etc.) — use Seer AI + `knowledge/`

---

## Free OSS reference map

| Need | Library | License notes |
|------|---------|---------------|
| Ephemeris precision | [swisseph-wasm](https://github.com/prolaxu/swisseph-wasm) | Swiss Ephemeris terms |
| Vedic analytics | [node-jhora](https://github.com/HariEshwar-J-A/node-jhora) | Check repo license |
| Vedic all-in-one | [openastrology-library](https://github.com/nikolamilenkovic/openastrology-library) | AGPL / LGPL + SWE license |
| Browser reference | [hora-prakash](https://github.com/priyankgahtori/hora-prakash) | AGPL — parity tests only |
| Western charts | [Kerykeion](https://github.com/g-battaglia/kerykeion) | Python; separate from Node path |
| Test vectors | [Astrolog](https://www.astrolog.org/astrolog.htm) | GPL desktop reference |

---

## AstroApp integration (legacy)

Optional env vars: `ASTROAPP_EMAIL`, `ASTROAPP_PASSWORD`, `ASTROAPP_API_KEY`.

Used only in: `lib/astroapp.ts`, `lib/hybridHoraryEngine.ts`, chart image proxy. **Primary paths do not call AstroApp.**

Recommended: keep env unset in production; remove AstroApp from `ServiceStatus` when fully native.

---

## Verification

After P0 changes:

```bash
pnpm test tests/unit/computedSkyPositions.test.ts
pnpm test tests/unit/engine-parity.test.ts
```

Manual: Western tool → Transits tab; Vedic daily insight — positions should match current sky (sign-level), not fixed 2025 tables.
