---
name: FutureSeer Clean Architecture
overview: "Atomic profile generation with all tools, immutable storage, read-only Seer, hard-routed intent/sub-intent, and conversation state. Generation is one-time; interpretation is continuous."
todos:
  - id: t1
    content: Lock Profile Generation → run all tools atomically
    status: completed
  - id: t2
    content: Separate Tool Reports vs Seer Master DB storage
    status: completed
  - id: t3
    content: Implement intent + sub-intent router (hard gate)
    status: completed
  - id: t4
    content: Add conversation_state + exclusion rules
    status: pending
  - id: t5
    content: Enforce response structure (direct answer, reason, optional support, stop)
    status: pending
  - id: t6
    content: Tool page isolation (read-only, no chat access)
    status: pending
isProject: true
---

# FUTURESEER — CLEAN, STABLE ARCHITECTURE PLAN

## CORE PRINCIPLE (non-negotiable)

> **Generation is one-time. Interpretation is continuous.**

Nothing is generated during chat.
Chat only **reads, selects, and narrates**.

---

## PHASE 1 — PROFILE GENERATION (ONE-TIME, ATOMIC)

### Trigger

**User clicks:** `Generate My Mystical Profile`

### What MUST happen (in order)

```
1. Lock Profile Generation
2. Run ALL tools (no exceptions)
3. Store each tool's output separately
4. Build Master Seer Database
5. Unlock Chat
```

### Tool execution rule

* Vedic Astrology, KP Astrology, Western Astrology, Hellenistic Astrology
* Tarot, Numerology, Chaldean, Kabbalistic, Angel Numbers
* Palmistry, Face Reading, Name Analysis
* I Ching, Runes, Lenormand, Pendulum, Geomancy, Ogham, Sortilege
* Navaratna & Planetary Stones, Trichakra Method, Feng Shui, Vastu, Energy & Healing
* Daily Decisions, Horary Astrology, Medical Astrology, Financial Astrology, Mundane Astrology
* Synastry, BaZi, Chinese Astrology (Zi Wei), Human Design
* Dream Symbols, Akashic Records, Scrying, Bibliomancy

❌ No lazy loading
❌ No "generate when needed"
❌ No partial profiles

If one tool fails → mark status but **do not rerun others**

---

## PHASE 2 — STORAGE MODEL

### A. Tool Report Store (Immutable)

Each tool has its **own sealed report**.

```
/reports
  /vedic_astrology.json
  /kp_astrology.json
  /tarot.json
  /numerology.json
  /remedies.json
  /timing.json
  ... (one per tool)
```

Rules:

* Read-only
* Never rewritten during chat
* Tool pages ONLY display these

### B. Master Seer Database (Derived, Structured)

This is what **Ask the Seer** reads.

```
/seer_master
  core_identity
  life_purpose
  career_themes
  relationship_patterns
  health_tendencies
  timing_windows
  remedies
    ├─ gemstones
    ├─ mudras
    ├─ colors
    ├─ mantras
    ├─ behaviors
```

This is NOT raw text. This is **normalized insight**.

---

## PHASE 3 — ASK THE SEER (READ-ONLY, STATEFUL)

### Allowed

✅ Read from `seer_master`
✅ Select relevant sections
✅ Combine narratively
✅ Track conversation state

### Not allowed

❌ Generate astrology
❌ Call tools
❌ Recompute dates
❌ Guess missing data

---

## PHASE 4 — INTENT & ROUTING (CRITICAL)

### Step 1: Intent Classification (hard gate)

```
INTENT TYPES
- purpose
- timing
- remedies
- decision
- relationship
- career
- health
- symbolic
```

If confidence < threshold → ask ONE clarifying question and STOP.

### Step 2: Sub-intent Resolution

Example for **remedies**:

```
remedies
├─ gemstones
├─ mudras
├─ colors
├─ mantras
├─ rituals
├─ behavioral
```

If user says "mudra / colour" → block gemstones entirely.

---

## PHASE 5 — CONVERSATION STATE

```
conversation_state = {
  active_intent: "timing",
  active_subintent: "launch_date",
  last_answer_type: "date",
  consumed_entities: ["2026-02-09"],
}
```

### Mandatory rules

* If a date is **consumed**, exclude it
* If sub-intent changes, **reset scope**
* Never repeat the same answer verbatim

---

## PHASE 6 — RESPONSE STRUCTURE

```
1. Direct answer (1–2 lines)
2. Reason (from ONE primary system)
3. Optional support (1 short line)
4. Stop
```

❌ No tool dumping
❌ No personality essays
❌ No "would you like to explore" spam

---

## PHASE 7 — TOOL PAGES (ISOLATED)

Each tool page:

* Reads only its report
* Never affects chat
* Never re-runs logic

---

## TOOL TAXONOMY (6 DOMAINS)

| Domain | Tools | Speak Rule |
|--------|-------|------------|
| **Identity** | Vedic, Western, Hellenistic, BaZi, Zi Wei, Human Design, Numerology, Face Reading, Palmistry, Name Analysis | 1–2 primary per answer |
| **Timing** | Vedic Dashas, KP, Horary, I Ching, Tarot, Runes, Lenormand, Pendulum, Sortilege, Daily Decisions | One timing authority |
| **Relationships** | Synastry, Vedic 7th, KP, Tarot, Chinese | Synastry leads |
| **Health** | Medical Astrology, Energy & Healing, Human Design, Face Reading, Palmistry | No remedies unless asked |
| **Remedies** | Navaratna, Trichakra, Vastu, Feng Shui, Energy & Healing | mudra/color blocks gemstones |
| **Symbolic** | Dream Symbols, Akashic Records, Scrying, Bibliomancy, Ogham, Geomancy, Mundane | Never for decisions/timing unless asked |

---

## IMPLEMENTATION ORDER

1. Lock "Generate Profile" → run all tools
2. Separate Tool Reports vs Seer Master DB
3. Implement intent + sub-intent router
4. Add conversation_state + exclusion rules
5. Enforce response structure
6. Only then refine tone/mysticism
