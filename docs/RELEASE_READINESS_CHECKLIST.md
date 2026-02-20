# Release Readiness Checklist — Ask the Seer

Controlled rollout guide. No internal plumbing changes during this phase.

---

## 1. Feature Flag / Cohort Gate

### Option A: Firebase Custom Claims ✅ (implemented)

**Default:** Full rollout (no gate). Ask the Seer works for all signed-in users.

**To re-enable gate:** Set `ASK_SEER_ROLLOUT=gated`. API route `app/api/seer/query/route.ts` will then require `askSeerBeta` claim or UID in `ASK_SEER_BETA_UIDS`. Returns 403 with friendly message if not in cohort.

**How to grant beta access:**

1. Run the script: `ASKS_BETA_UIDS=uid1,uid2,uid3 node scripts/set-ask-seer-beta.js`

2. Or use Admin API: `POST /api/admin/set-claims` with `{ uid, claims: { ...existingClaims, askSeerBeta: true } }` (merge existing claims yourself)
3. Or inline: `const user = await getAuth().getUser(uid); await getAuth().setCustomUserClaims(uid, { ...(user.customClaims || {}), askSeerBeta: true });`

### Option B: Environment Variable

```env
ASK_SEER_ROLLOUT=internal   # internal | beta | all
```

- `internal`: Only users in a hardcoded list (e.g. your UIDs)
- `beta`: Users with custom claim
- `all`: No gate

### Option C: Percentage Rollout

If you use a config service (Firestore, Vercel Edge Config):

```json
{ "askSeerRolloutPercent": 5 }
```

Hash `userId` and compare to threshold. Start at 5%, then 25%, 50%, 100%.

---

## 2. Rollout Steps

| Step | Action | Duration |
|------|--------|----------|
| 1 | Deploy with feature flag OFF (or internal-only) | — |
| 2 | Add 3–5 internal users to beta cohort | — |
| 3 | Turn on flag for cohort | 72 hours |
| 4 | Run daily checks (see Section 4) | Each day |
| 5 | If stop condition hits → pause, fix, re-evaluate | — |
| 6 | If no stop conditions after 72h → expand to 10–20 users | 48 hours |
| 7 | If stable → expand to 100% or next tier | — |

---

## 3. Stop Conditions (halt rollout immediately)

| Condition | Severity | Action |
|-----------|----------|--------|
| Placeholder bleed (primarySource = placeholder tool) | Critical | Disable rollout; fix gate |
| Clarification loop (> 3 clarifications in one session) | High | Pause; review router |
| Repeated same answer (responseHash duplicate in session) | High | Pause; check consumed-entity logic |
| Firestore `seerDecisionEvents` write failures > 5% | Medium | Fix telemetry; continue rollout |
| User-reported “wrong answer” or “confused” (if tracked) | Medium | Triage; fix if systemic |
| Cross-domain mix (e.g. KP timing + Tarot timing in same answer) | High | Pause; check synthesis |

**Rule:** One critical or two high → stop. Fix. Re-validate. Resume.

---

## 4. Daily Checks (72-hour window)

Run once per day. Use Firestore or your log sink.

### A. Event integrity

- [ ] ~1 event per turn (no double-emits)
- [ ] `clarificationAsked` true only on clarification turns
- [ ] `primarySource` present only on answer turns
- [ ] No `placeholder` in `primarySource` (when primarySource is set)

### B. Behavioral health

- [ ] Clarifications per session ≤ 1 in >95% of sessions
- [ ] No session with > 3 clarifications
- [ ] Repeat-answer rate (same hash in session) < 5%

### C. Domain discipline

- [ ] One primary source per answer
- [ ] Palmistry only when activated (palm photo uploaded)
- [ ] No cross-domain timing mixes

### D. Telemetry

- [ ] `seerDecisionEvents` collection growing
- [ ] No spike in failed writes (if you log failures)

---

## 5. Do NOT Do During Rollout

- ❌ Wire more tools
- ❌ Expand jurisdictions
- ❌ Polish tone or prose
- ❌ Change routing rules
- ❌ Add new sinks or dashboards
- ❌ Refactor Seer engine
- ❌ Loosen placeholder rules

**Observe first.** Fix only what telemetry proves is broken.

---

## 6. Post-Rollout (when 100% stable)

- Remove feature flag or set to `all`
- Document any one-off fixes in `TOOL_WIRING_CHECKLIST.md` or `RELEASE_READINESS_CHECKLIST.md`
- Freeze Seer behavior for 2 weeks
- Plan next tool or UX polish only after freeze

---

## 7. Quick Reference

| Item | Location |
|------|----------|
| Telemetry events | Firestore `seerDecisionEvents` |
| Dashboard spec | `docs/SEER_OBSERVABILITY_DASHBOARDS.md` |
| Tool wiring | `docs/TOOL_WIRING_CHECKLIST.md` |
| Palmistry activation | `POST /api/profile/update-palmistry` |
| Seer API | `POST /api/seer/query` |

---

## 8. Summary

1. **Add** feature flag (claims or env).
2. **Expose** to 3–5 internal users.
3. **Run** 72 hours with daily checks.
4. **Stop** if any stop condition triggers.
5. **Fix** only proven issues.
6. **Expand** gradually.
7. **Freeze** behavior when stable.
