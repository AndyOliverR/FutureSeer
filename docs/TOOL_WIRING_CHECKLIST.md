# Tool Wiring Checklist

Use this checklist when wiring each new tool into the Main Ask the Seer.

---

## Before You Start

- [ ] Tool has a dedicated page or API
- [ ] Tool returns structured data (no raw LLM blobs)
- [ ] Tool does not require user input at generation time (e.g. hand image, question) OR you have a clear placeholder strategy

---

## 1. Profile Generation (`lib/profileGenerationOrchestrator.ts`)

### Where it writes

| Location | Purpose |
|----------|---------|
| `runTool()` switch case | Add `case 'toolSlug':` with real implementation |
| `toolReports[toolSlug]` | Success/fail + data stored here |
| `comprehensiveProfile[toolSlug]` | Merged from successful `toolReports` (auto) |

### Done definition

- [ ] Returns `{ status: 'success', data: {...} }` with real content
- [ ] Does **not** set `placeholder: true` in data
- [ ] Data shape matches what the Seer aggregator expects (see 2)

### Placeholder rule

If the tool cannot run at generation time (e.g. needs hand image):

- Return `{ status: 'success', data: { placeholder: true, reason: '...' } }`
- Status must remain `'success'` so other tools are not blocked
- Seer aggregator will skip tools with `placeholder: true` or missing data

### Placeholder-only tools (default case in runTool)

These slugs are in `ALL_TOOL_SLUGS` but have no dedicated `runTool()` case yet. They receive the generic placeholder so the pipeline does not block. Wire them when a one-shot or profile-only API exists.

| Tool slug | Reason |
|-----------|--------|
| runes | Requires question or draw at read time; no birth-only report API |
| lenormand | Requires question or spread; no birth-only report API |
| pendulum | Requires question/session; no one-shot report from profile |
| geomancy | Requires question or figure generation; no profile-only report |
| sortilege | Multi-method (I Ching, Tarot, etc.); typically question-based |
| faceReading | Requires face/hand image or session; no birth-only report |
| nameAnalysis | Could be wired if API accepts name + birth from profile |
| angelNumbers | Could be wired if API accepts birth/context only |
| kabbalisticNumerology | Could be wired if API accepts profile only |
| fengShui | Could be wired if API accepts birth + location only |
| vastu | Could be wired if API accepts profile only |
| horary | Requires a specific question and chart for that moment |
| synastry | Requires two birth charts; not single-user profile-only |

**Wired in pipeline (real report or placeholder with reason):** vedic, western, astrocartography, esotericAstrology, psychologicalAstrology, shamanicAstrology, kabbalisticAstrology, hermeticAstrology, hellenistic, kp, numerology, tarot, iching, palmistry, dailyDecisions, medicalAstrology, financialAstrology, mundaneAstrology, ziweiDouShu, scrying, ogham, bazi, humanDesign, navaratna, trichakra, energyHealing, akashicRecords, bibliomancy.

---

## 2. Seer Aggregator (`lib/seerAggregator.ts`)

### Where it reads

- `comprehensiveProfile[toolSlug]` or `comprehensiveProfile['Display Name']`
- `PROFILE_KEY_TO_TOOL` mapping (add if display name differs from slug)

### Required data shape per tool

| Tool | Required field(s) | Skip when |
|------|-------------------|-----------|
| vedic | `planets`, `ascendant`, `houses` | Missing chart |
| western | `chart` | Missing chart |
| tarot | `profile` (birthCard, lifePathCard, soulCard, personalityCard) | Missing profile |
| numerology | `lifePathNumber`, `breakdown` | Missing data |
| kp | `cusps`, `timingAnalysis` | Missing or empty |
| iching | `hexagram` (number, name, lines) | Missing hexagram |
| palmistry | `palmistryContext` | Missing (user must upload) |
| faceReading | Hand/face analysis | Missing |

---

## 3. Jurisdiction Matrix (`lib/universalSeerJurisdiction.ts`)

### Allowed domains (what this tool may answer)

Add to `DOMAIN_JURISDICTION_MATRIX`:

```ts
{ tool: 'toolSlug', answersWhat: ['timing', 'guidance', 'general'] }
```

### Forbidden domains (what this tool must NEVER speak in)

- Do **not** add the tool to jurisdictions it cannot answer
- If a question type is out of scope, the aggregator will not call it

---

## 4. Telemetry (`lib/seerTelemetry.ts`)

### toolStatusesUsed

- `buildToolStatusesUsed()` infers `ready` vs `placeholder` from `universalData`
- Add display name → data key mapping in `DISPLAY_NAME_TO_DATA_KEY` if the tool uses a new key
- Add short id in `DATA_KEY_TO_ID` for telemetry output

---

## 5. Palmistry Activation Flow

```
IF palmPhotoUrl exists
  → run analysis (profile gen or update-palmistry API)
  → store { palmistryContext, analysis } in comprehensiveProfile.palmistry
  → status = ready
ELSE
  → placeholder
```

**When user uploads palm AFTER profile generation:** Call `POST /api/profile/update-palmistry` (Bearer token) to run analysis and merge into `comprehensiveMysticalProfiles`. Cache is invalidated automatically.

---

## 7. Gating Placeholders (future)

When ready, add to Seer synthesis:

```ts
if (tool.status !== 'ready') {
  exclude from seerMaster synthesis
}
```

---

## First 5 Tools — Wiring Status

| Tool | Profile gen | Aggregator | Jurisdiction | Status |
|------|-------------|------------|--------------|--------|
| Tarot | ✅ | ✅ | ✅ | Ready |
| KP Astrology | ✅ | ✅ | ✅ | Ready |
| Western Astrology | ✅ | ✅ | ✅ | Ready |
| Palmistry | ✅ (when palmPhotoUrl) | ✅ | ✅ | Ready* |
| I Ching | ✅ (birth hexagram) | ✅ | ✅ | Ready |

\* Palmistry: **Activation rule** — `images_uploaded && analysis_complete → ready`, else placeholder.
- Profile gen: runs analysis when `profile.palmPhotoUrl` exists
- Post-upload: call `POST /api/profile/update-palmistry` (auth) to merge analysis into comprehensive profile

---

## 7. Checklist per new tool

1. [ ] Add `case 'toolSlug':` in `runTool()` with real data
2. [ ] Ensure `comprehensiveProfile` merge includes the tool (automatic if in toolReports)
3. [ ] Add/verify `PROFILE_KEY_TO_TOOL` and aggregator `case` if needed
4. [ ] Add/verify `DOMAIN_JURISDICTION_MATRIX` entry
5. [ ] Add `DISPLAY_NAME_TO_DATA_KEY` if new system name
6. [ ] Run profile generation and confirm `toolStatusesUsed` shows `ready`
7. [ ] Ask a question in that domain and confirm tool is called
