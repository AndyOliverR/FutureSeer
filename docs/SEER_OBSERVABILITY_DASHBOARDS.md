# Seer Observability — Dashboards & Queries

Production telemetry emits `[SeerDecision]` + JSON per turn. This doc defines dashboards, queries, and alert thresholds.

---

## 1. Log Format

**Prefix:** `[SeerDecision]`  
**Payload:** JSON (single line)

```json
{
  "userId": "...",
  "sessionId": "...",
  "timestamp": 1234567890,
  "intent": "timing",
  "subIntent": "when",
  "domain": "timing",
  "clarificationAsked": false,
  "clarificationType": "none",
  "primarySource": "vedic",
  "supportingSources": ["numerology"],
  "responseHash": "abc123...",
  "consumedEntities": ["2026-02-15"],
  "toolStatusesUsed": { "vedic": "ready", "tarot": "ready", "palmistry": "placeholder" },
  "_schema": "SeerDecisionEvent_v1"
}
```

---

## 2. Dashboard Metrics

### A. Clarification Health

| Metric | Definition | Good | Warning |
|--------|------------|------|---------|
| **Clarification rate** | `clarificationAsked=true` / total turns | < 15% | > 25% |
| **Clarification by intent** | Break down by `intent` when `clarificationAsked` | remedies, general highest | — |
| **Clarification type** | `clarificationType` distribution | Mostly sub-intent | Intent > 40% |

**Why:** High clarification rate = users stuck; intent-level clarifications suggest routing gaps.

---

### B. Domain Balance

| Metric | Definition | Good | Warning |
|--------|------------|------|---------|
| **Turns per intent** | Count by `intent` | Balanced | One intent > 50% |
| **Primary source distribution** | Count by `primarySource` | Vedic 30–50%, others spread | Vedic > 70% |
| **Domain concentration** | Top 3 intents / total | < 80% | > 90% |

**Why:** Over-reliance on one domain = synthesis drift or tool underuse.

---

### C. Placeholder Audit

| Metric | Definition | Good | Warning |
|--------|------------|------|---------|
| **Placeholder usage rate** | Turns where any `toolStatusesUsed[k]=placeholder` | < 20% | > 40% |
| **Placeholder in primary** | `primarySource` maps to placeholder tool | 0% | > 0% |
| **Tools with placeholders** | Unique tools with `placeholder` status | palmistry only | Others |

**Why:** Placeholder in primary = bleed-through; multiple placeholders = wiring lag.

---

### D. Repetition & Exclusion

| Metric | Definition | Good | Warning |
|--------|------------|------|---------|
| **Repeat-answer rate** | Same `responseHash` in session | < 5% | > 15% |
| **Consumed entities per turn** | Avg `consumedEntities.length` | 0–2 | > 5 |
| **Avg turns to resolution** | Turns per session before clarification stops | < 3 | > 5 |

**Why:** High repeat = exclusion/consumption failing; high turns = clarification fatigue.

---

### E. Session Health

| Metric | Definition | Good | Warning |
|--------|------------|------|---------|
| **Turns per session** | Count by `sessionId` | 2–6 | > 10 or 1 only |
| **Sessions with clarification** | Sessions where any turn has `clarificationAsked` | < 30% | > 50% |
| **Single-turn sessions** | Sessions with 1 turn only | < 40% | > 60% |

**Why:** Very short or very long sessions indicate friction or confusion.

---

## 3. Example Queries

### Assumptions

- Logs are in a queryable sink (BigQuery, Datadog, Cloud Logging, etc.)
- `SeerDecisionEvent` is extracted into a table/view or parsed from raw text

### A. BigQuery (structured table)

Assume `SeerDecisionEvent` is in `project.dataset.seer_events`:

```sql
-- Clarification rate (last 24h)
SELECT
  COUNTIF(clarificationAsked) / COUNT(*) AS clarification_rate,
  COUNT(*) AS total_turns
FROM `project.dataset.seer_events`
WHERE timestamp >= UNIX_MILLIS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR));

-- Clarifications by intent
SELECT intent, COUNT(*) AS clarifications
FROM `project.dataset.seer_events`
WHERE clarificationAsked = true
  AND timestamp >= UNIX_MILLIS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY))
GROUP BY intent
ORDER BY clarifications DESC;

-- Primary source distribution
SELECT primarySource, COUNT(*) AS turns
FROM `project.dataset.seer_events`
WHERE clarificationAsked = false
  AND primarySource IS NOT NULL
  AND timestamp >= UNIX_MILLIS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY))
GROUP BY primarySource
ORDER BY turns DESC;

-- Placeholder in primary (CRITICAL - should be 0)
SELECT COUNT(*) AS bad_turns
FROM `project.dataset.seer_events`
WHERE clarificationAsked = false
  AND primarySource IS NOT NULL
  AND (
    (primarySource = 'palmistry' AND JSON_VALUE(toolStatusesUsed, '$.palmistry') = 'placeholder')
    OR (primarySource = 'faceReading' AND JSON_VALUE(toolStatusesUsed, '$.faceReading') = 'placeholder')
    -- Add others as needed
  )
  AND timestamp >= UNIX_MILLIS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY));

-- Repeat-answer rate by session
WITH session_hashes AS (
  SELECT sessionId, responseHash, COUNT(*) AS cnt
  FROM `project.dataset.seer_events`
  WHERE responseHash IS NOT NULL AND clarificationAsked = false
  GROUP BY sessionId, responseHash
  HAVING cnt > 1
)
SELECT COUNT(DISTINCT sessionId) AS sessions_with_repeats
FROM session_hashes;

-- Avg turns per session
SELECT AVG(turn_count) AS avg_turns_per_session
FROM (
  SELECT sessionId, COUNT(*) AS turn_count
  FROM `project.dataset.seer_events`
  WHERE timestamp >= UNIX_MILLIS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY))
  GROUP BY sessionId
);
```

### B. JSON log parsing (Vercel / stdout)

If logs are plain text with `[SeerDecision]` prefix:

```javascript
// Parse a log line
function parseSeerLog(line) {
  const prefix = '[SeerDecision]';
  if (!line.includes(prefix)) return null;
  const json = line.split(prefix)[1]?.trim();
  if (!json) return null;
  try {
    const event = JSON.parse(json);
    if (event._schema === 'SeerDecisionEvent_v1') return event;
  } catch (_) {}
  return null;
}
```

For aggregation, stream logs into a processor that:
1. Filters lines containing `[SeerDecision]`
2. Parses JSON
3. Writes to your analytics backend (BigQuery, Firestore, etc.)

### C. Firestore (if you add a write path)

If you add `sendToAnalytics` in `emitSeerDecision`:

```ts
// Firestore collection: seerDecisionEvents
// Document ID: {timestamp}_{userId} or auto-generated
// Fields: same as SeerDecisionEvent
```

Query examples (Firestore Admin SDK or client):

```javascript
// Clarification rate (last 24h)
const snapshot = await db.collection('seerDecisionEvents')
  .where('timestamp', '>=', Date.now() - 86400000)
  .get();
const total = snapshot.size;
const clarifications = snapshot.docs.filter(d => d.data().clarificationAsked).length;
const rate = clarifications / total;
```

---

## 4. Alert Thresholds

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| **Placeholder bleed** | `primarySource` = tool with `placeholder` status | Critical | Block that tool from primary until ready |
| **Clarification loop** | > 3 clarifications in same session | High | Review router + clarification questions |
| **Clarification rate spike** | > 30% over 24h (vs 7d baseline) | Medium | Check recent router/decomposition changes |
| **Domain overload** | One intent > 60% of turns (7d) | Medium | Review question distribution or routing |
| **Repeat-answer spike** | > 20% of sessions have repeat hash | Medium | Check consumed-entity logic |

---

## 5. Dashboard Layout (recommended)

### Panel 1: Overview (top row)

- Total turns (24h, 7d)
- Clarification rate (gauge)
- Placeholder-bleed count (0 = green)
- Primary source pie chart

### Panel 2: Clarification Health

- Clarification rate over time (line)
- Clarifications by intent (bar)
- Clarification type distribution (pie)

### Panel 3: Domain Balance

- Turns by intent (bar)
- Primary source distribution (bar)
- Tool status breakdown (ready vs placeholder)

### Panel 4: Session Quality

- Avg turns per session
- Sessions with clarification (%)
- Repeat-answer rate

### Panel 5: Alerts & Anomalies

- Placeholder bleed events (table)
- Sessions with > 3 clarifications (table)

---

## 6. Implementation Options

### Option A: Vercel Log Drains

- Configure a log drain to Datadog, Axiom, or similar
- Filter for `[SeerDecision]` and parse JSON
- Build dashboards in that tool

### Option B: Firestore write ✅ (implemented)

`emitSeerDecision` now writes to `seerDecisionEvents` when Firebase Admin is available. Each document has:
- All `SeerDecisionEvent` fields
- `_schema: 'SeerDecisionEvent_v1'`
- `_ingestedAt`: ISO timestamp

**Query via Firebase Console or Admin SDK:** Use the Firestore query examples in Section 3C.

### Option C: BigQuery via Cloud Logging

- Deploy to GCP or use Vercel → Cloud Logging
- Export logs to BigQuery
- Use the SQL queries above

---

## 7. Quick Validation (no dashboard yet)

During dogfooding, grep logs locally:

```bash
# Clarification count
grep '\[SeerDecision\]' logs.txt | grep -o '"clarificationAsked":true' | wc -l

# Total turns
grep '\[SeerDecision\]' logs.txt | wc -l

# Placeholder in toolStatusesUsed
grep '\[SeerDecision\]' logs.txt | grep '"placeholder"' | wc -l
```

---

## 8. Summary

| Deliverable | Status |
|-------------|--------|
| Metric definitions | Done |
| Example queries (BigQuery, parse, Firestore) | Done |
| Alert thresholds | Done |
| Dashboard layout | Done |
| Implementation options | Done |

Next: Choose a log sink (Datadog, Firestore, BigQuery) and wire `emitSeerDecision` or a log drain accordingly.
