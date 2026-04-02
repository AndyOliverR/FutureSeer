# Astrology engine audit (one-time depth)

**Purpose:** Compare FutureSeer’s calculation stack to what a desktop reference suite (e.g. [Astrolog](https://www.astrolog.org/astrolog.htm)) typically offers, so we know **what we implement**, **where**, **what is approximate**, and **what is out of scope** for the product.

**Audience:** Engineers and product. Not a user-facing accuracy guarantee.

**Date:** 2026-03-24 (repo snapshot). **Updated same day** for gap-closure work below.

---

## Updates (gap closure — 2026-03-24)

The following audit gaps were **implemented in code** (not only documented):

- **Vedic `getHouseCusps` + `placidus`:** Uses **`calculateTropicalHouses`** (tropical Placidus cusps), then **subtracts each cusp by the chosen ayanamsha** so sidereal Placidus matches the same engine as Western tropical houses. See `lib/astronomia-vedic.ts`.
- **HTTP `/api/swiss-ephemeris/*`:** **`planets`**, **`houses`**, and **`aspects`** routes now call **`lib/western/tropicalCalculator.ts`** (and `lib/apiEphemerisTropical.ts` helpers) with **`birthLocalToUTC`** — **not** placeholder sine waves. Metadata labels the engine as **in-app tropical** (legacy URL path kept for compatibility). **Koch** on the houses route returns **Placidus cusps** with an explicit **`metadata.note`** until native Koch exists.
- **Chiron:** **`calculateTropicalPlanets`** now includes **`chiron`** using a **documented mean-motion approximation** (~0.01942°/day from J2000) — not Swiss-grade; suitable for sign-level / narrative use.

**Still not implemented:** Swiss Ephemeris **binary** / **SE** file-grade accuracy; **native Koch**; **full asteroid** set; **fixed stars** (unchanged). **`lib/astrologyUnified.ts`** WASM path remains optional.

## Updates (Western hybrid — 2026-04-02)

- **`/api/occult/universal` (`system: western`):** When **`computeSwissNatalPlanets`** ([`lib/western/swissNatalChart.ts`](lib/western/swissNatalChart.ts)) initializes **`swisseph-wasm`**, natal **planet longitudes** use **Swiss Ephemeris WASM** with **Moshier** built-ins (`SEFLG_MOSEPH` + speed). **House cusps** remain **`calculateTropicalHouses`** (in-app Placidus). Response includes **`ephemeris`** metadata describing this **hybrid**. If WASM fails, the route falls back to **`calculateTropicalPlanets`** (Astronomia) as before.
- **Nodes / Lilith:** Swiss path provides **true node** (`SE_TRUE_NODE`), **south node** (opposite), **mean Lilith** (`SE_MEAN_APOG`), and **Chiron** (`SE_CHIRON`) from the same WASM `calc_ut` pipeline.
- **Regression:** [`tests/unit/westernBirthTimeAndFacts.test.ts`](../tests/unit/westernBirthTimeAndFacts.test.ts) checks Sun longitude band for the Mysore UTC sample when WASM is available.
- **Legacy `/api/swiss-ephemeris/planets`:** Still **not** Swiss binary output; consider aligning metadata copy with the universal route over time.

---

## 1. Executive summary

| Theme | Finding |
|-------|---------|
| **Core Western tropical** | Primary path is `lib/western/tropicalCalculator.ts` (Astronomia / VSOP-style elements): **Sun–Pluto**, **Chiron (mean-motion approx.)**, **mean lunar nodes**, **Placidus** houses with documented **simplified** intermediate cusp logic; **equal-house fallback** on error. |
| **Sidereal / Vedic** | Multiple paths: `lib/vedic/siderealCalculator.ts` (Lahiri + tropical-derived houses), `lib/astronomia-vedic.ts` **`getChart`** (several **ayanamshas**, **whole-sign / equal / placidus**). **`placidus`** in `getHouseCusps` is **tropical Placidus minus ayanamsha** (same `calculateTropicalHouses` engine as Western). |
| **KP** | `lib/kpAstrologyIntelligence.ts` uses **`getChart`** with **KP ayanamsha** and **`placidus`** — now aligned with **real Placidus-derived** sidereal cusps. |
| **Legacy `/api/swiss-ephemeris/*` routes** | Use **`calculateTropicalPlanets` / `calculateTropicalHouses`** via **`lib/apiEphemerisTropical.ts`**; **not** Swiss Ephemeris SE binaries — see `metadata.engine` in JSON responses. |
| **Higher-precision path** | `lib/astrologyUnified.ts` documents **WASM Swiss** (`swisseph-wasm`) with dynamic import; treat as **optional** / environment-dependent. |
| **Minor bodies** | **Chiron** is in **`calculateTropicalPlanets`** (approximation). Asteroid **names** still appear elsewhere for integration; **not** a full minor-body ephemeris. |
| **Risk** | **Copy vs code:** Hellenistic and other tools **describe Whole Sign** in prompts/copy; Western tropical stack is **Placidus-first**. Always match **marketing** to the **actual** code path per tool. |

---

## 2. Reference baseline (Astrolog-class)

Use as a **checklist**, not a requirement to match feature-for-feature:

- **Zodiac:** Tropical; sidereal; multiple ayanamshas.
- **Bodies:** Classical + modern planets; nodes; optional Chiron, asteroids, fixed stars, lots.
- **Houses:** Placidus, Koch, Equal, Whole Sign, Campanus, Regiomontanus, etc.
- **Charts:** Natal, transits, returns, progressions, composites — **FutureSeer** is product-driven (per-tool), not a full workstation clone.

---

## 3. Implementation map (where logic lives)

### 3.1 Western tropical — primary

| Concern | Location | Notes |
|--------|----------|--------|
| Planet longitudes (tropical) | `lib/western/tropicalCalculator.ts` | `calculateTropicalPlanets` — inner planets through VSOP data; outers via orbital elements; nodes from lunar model. |
| Houses | Same file | `calculateTropicalHouses` → **Placidus** (`calculatePlacidusHouses`); **equal** fallback on failure. |
| Human Design input | `lib/humanDesign/humanDesignCalculator.ts` | Imports tropical planets + houses for chart construction. |

### 3.2 Sidereal (Lahiri) — wrapper path

| Concern | Location | Notes |
|--------|----------|--------|
| Tropical → sidereal | `lib/vedic/siderealCalculator.ts` | Applies **Lahiri**-style ayanamsha to tropical longitudes; asc from **tropical Placidus** then siderealized. |

### 3.3 Vedic chart — `getChart` / divisional / dasha

| Concern | Location | Notes |
|--------|----------|--------|
| Ayanamsha | `lib/astronomia-vedic.ts` | **lahiri**, **raman**, **kp**, **yukteshwar**, plus numeric custom via `ayanamshaValue`. |
| House systems | `getHouseCusps` | **`whole-sign`**, **`equal`**, **`placidus`** — **placidus** = tropical Placidus cusps (`calculateTropicalHouses`) **minus ayanamsha**. |
| Full chart | `getChart` | Combines houses + `getAllPlanetCoords`, divisional charts, Vimshottari dasha hooks (see file). |

### 3.4 KP astrology

| Concern | Location | Notes |
|--------|----------|--------|
| Chart pipeline | `lib/kpAstrologyIntelligence.ts` | `getChart({ ayanamsha: 'kp', houseSystem: 'placidus' })` — verify against **3.3** house behavior. |

### 3.5 Synastry / compatibility

| Concern | Location | Notes |
|--------|----------|--------|
| Western pairs | `lib/compatibility/westernAstrologyCompatibility.ts`, `lib/synastryIntelligence.ts` | **`houseSystem: 'placidus'`** in chart options. |

### 3.6 HTTP legacy path `/api/swiss-ephemeris/*` (in-app tropical)

| Concern | Location | Notes |
|--------|----------|--------|
| Client | `lib/swissEphemerisService.ts` | Fetches `/api/swiss-ephemeris/*`. |
| Helpers | `lib/apiEphemerisTropical.ts` | UTC via `birthLocalToUTC`; maps **`calculateTropicalPlanets` / `calculateTropicalHouses`** to API rows. |
| Routes | `app/api/swiss-ephemeris/planets/route.ts`, `houses/route.ts`, `aspects/route.ts` | **Same engine as Western tools** — **not** Swiss Ephemeris SE binaries; response `metadata.engine` describes source. OK for parity with **`tropicalCalculator`**; not OK vs Astrolog SE unless both use the same assumptions. |

### 3.7 Unified / WASM

| Concern | Location | Notes |
|--------|----------|--------|
| WASM init | `lib/astrologyUnified.ts` | `swisseph-wasm` dynamic import — **may** be unused or partial depending on build; confirm before relying on it in CI. |

### 3.8 Product / tool copy (non-executable but important)

| Concern | Location | Notes |
|--------|----------|--------|
| Hellenistic | `lib/hellenisticSeerPrompts.ts`, `lib/hellenistic/hellenisticReportGenerator.ts` | **Whole sign** mandated in expert copy; ensure **generated numbers** use the same system as `getIntelligentHellenisticAstrologyData` / engines (audit that chain separately). |

---

## 4. Gap matrix (vs a full desktop ephemeris)

Legend: **Yes** = implemented in a clear primary path · **Partial** = optional, placeholder, or simplified · **No** = not treated as first-class in core tropical pipeline · **N/A** = product may not need it.

| Capability | Status | Notes |
|-------------|--------|--------|
| Tropical zodiac | **Yes** | `tropicalCalculator` |
| Sidereal + multiple ayanamshas | **Partial** | **Yes** in `astronomia-vedic`; **Lahiri-focused** path in `siderealCalculator` |
| Sun–Saturn + Uranus/Neptune/Pluto | **Yes** | Core tropical |
| Lunar nodes | **Yes** | Mean-style node math in tropical pipeline; verify “true node” if product claims it |
| Chiron | **Partial** | Referenced in UI/integration/life journey; **not** in core `calculateTropicalPlanets` list |
| Major asteroids (Ceres, Pallas, etc.) | **Partial** | Naming in `astroAppChartIntegration` / themes; **not** core ephemeris for all tools |
| Fixed stars | **Partial** | Types / service shapes in `swissEphemerisService`; **not** same as Swiss-grade API |
| Placidus (Western) | **Partial** | Implemented with **simplified** intermediate cusps (see comments in `tropicalCalculator`) |
| Placidus (Vedic `getHouseCusps`) | **Partial** | **Tropical Placidus minus ayanamsha**; still **simplified** intermediate Placidus in `tropicalCalculator` |
| Whole sign | **Yes** | `getHouseCusps` when `system === "whole-sign"` |
| Equal house | **Yes** | Western fallback; Vedic `equal` |
| Koch / Campanus / Regiomontanus / etc. | **Partial** | **HTTP Koch** returns **Placidus** cusps + **`metadata.note`**; Campanus / Regio **not** implemented |
| User-selectable house system (Western UI) | **Partial** | `toolDataMapper` defaults **Placidus**; full picker parity with Astrolog **not** implied |
| Swiss-grade ephemeris file accuracy | **No** (default stack) | **WASM path** may improve; routes use **Astronomia tropical**, not SE file accuracy |
| Solar arc / secondary progressions | **N/A** / **Partial** | Depends on tool; not enumerated here |
| Transit vs natal | **Partial** | Various tools; single pipeline doc: `AGENTS.md` (UTC birth time) |

---

## 5. Architectural risks

1. **Two main tiers of truth:** (A) **Astronomia tropical** in-process (including **`/api/swiss-ephemeris/*`** now), (B) **astronomia-vedic** `getChart` + divisionals. **`lib/astrologyUnified.ts`** WASM remains a possible third tier if enabled.
2. **Naming debt:** URL path **`/api/swiss-ephemeris`** is **legacy**; responses use **`metadata.engine`** to clarify **in-app tropical**. Filenames may still confuse operators.
3. **House system drift:** Whole-sign **text** vs Placidus **numbers** in different tools confuses users and QA.

---

## 6. Recommended parity tests (engineering)

Use **one** canonical chart (UTC-normalized per `lib/birthDateTimeToUTC` / pipeline in `AGENTS.md`):

1. **Western tropical:** Compare **Sun–Moon–Asc** and **house cusps** from `calculateTropicalHouses` to a trusted reference (manual Astrolog export or NASA/JPL check for planets only).
2. **Vedic whole-sign:** Compare **sidereal longitudes** and **whole-sign house signs** from `getChart` / `getHouseCusps(..., { system: 'whole-sign' })`.
3. **`/api/swiss-ephemeris/*`** may be used to parity-check **`tropicalCalculator`** (same engine); still **not** Swiss Ephemeris SE file output.

Document **tolerance** (e.g. ±0.1° planets, ±1° cusps) in test files when adding Jest cases.

---

## 7. Product recommendations (optional)

1. **Disclose** in UI or docs: default **Western** = tropical **Placidus** (with implementation caveats); **Vedic** tool may use **whole sign** where stated.
2. **Rename or gate** “Swiss Ephemeris” API routes if they remain placeholders, to avoid legal/accuracy implications.
3. **Prioritize** one **high-precision** path (e.g. WASM or server-side `swisseph`) for **one** flagship tool before expanding.

---

## 8. Files to re-read when changing astrology behavior

- `lib/western/tropicalCalculator.ts`
- `lib/vedic/siderealCalculator.ts`
- `lib/astronomia-vedic.ts` (`getChart`, `getHouseCusps`, `getAllPlanetCoords`)
- `lib/kpAstrologyIntelligence.ts`
- `lib/birthDateTimeToUTC.ts`, `lib/birthTimeUtils.ts` (per `AGENTS.md`)
- `app/api/swiss-ephemeris/**/*.ts` (if replacing placeholders)

---

*This document is a one-time depth snapshot; update it when the Swiss placeholder routes or core Placidus implementation change materially.*
