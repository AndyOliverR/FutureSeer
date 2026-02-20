# Main Seer Stress Test

Use this checklist to validate anti-loop behavior, domain anchoring, confidence display, and response quality. Run through manually or automate against the Ask the Seer API.

## Expected behavior (global)

- **No bridge phrases:** No "This builds on what we just saw", "Earlier I said", or "As previously stated" in any answer.
- **No generic clarification in anchored domain:** When the user is in a clear domain (e.g. purpose, remedy), do not show "Could you clarify what you'd like to know?"; answer or ask a targeted follow-up.
- **Confidence:** When the answer indicates insufficient data or confidence &lt; 0.4, UI shows "Insufficient chart data" (or badge hidden), not a numeric % like "32% Confidence".
- **Same-domain follow-ups:** Second answer in the same domain (e.g. purpose) must give a **different angle** (obstacles vs practices vs alignment), not repeat the same core paragraph.
- **No personality-first for relocation:** Relocation answers should focus on location/timing, not lead with personality or planetary positions.
- **No diagnosis for health:** Health answers must not provide medical diagnosis; stick to lifestyle/timing/energetic support.

---

## Question list and expected outcome

| # | Question / flow | Expected outcome |
|---|------------------|------------------|
| 1 | What is my life purpose? | Direct purpose answer; no bridge phrase. |
| 2 | (Follow-up) What obstacles might I face? | Different angle (Saturn/shadow/fear, blocks); no "This builds on" / "Earlier I said"; no repeat of the core purpose paragraph. |
| 3 | (Follow-up) What are my spiritual practices? | Different angle (9th house/discipline); no repetition of purpose paragraph. |
| 4 | (Follow-up) How can I align with my purpose? | Different angle (habits/soul ruler); no repetition of purpose paragraph. |
| 5 | When will I get a promotion or breakthrough? | Career timing answer; confidence shown only if meaningful. |
| 6 | Which career path suits me? | Career outcome/suitability; not generic "clarify what you'd like to know". |
| 7 | When will this happen? (standalone) | Timing clarification or favorable-date style answer; no personality dump. |
| 8 | Which option is better for me? (standalone) | Targeted clarification (which options?) or comparison answer; no generic clarification. |
| 9 | Is relocation favorable? | Relocation-focused answer; **no** personality or planetary positions as lead. |
| 10 | Which city or country suits me? | Location/suitability; no personality-first. |
| 11 | Is this person my soulmate? | Relationship/soulmate insight; no missing-data dump if profile is complete. |
| 12 | What does my chart say about marriage? | Marriage domain answer; no generic "clarify". |
| 13 | What is the root cause of my health issue? | Lifestyle/energetic/timing support only; **no** medical diagnosis. |
| 14 | When will my health improve? | Timing or supportive factors; no diagnosis. |
| 15 | What remedies will work for me? | Remedies domain; no generic "when you say remedies, do you want…" if already in remedy context. |
| 16 | (After gemstone answer) Which finger should I wear it on? | Remedy sub-question answered with context; no re-clarify for finger/metal. |
| 17 | (After gemstone answer) What metal is best? | Metal recommendation with gemstone context; no generic clarification. |
| 18 | Is this good for me? (ambiguous) | **Targeted** clarification (e.g. "In which area—career, relationship, or health?") or short binary-style answer; not generic "Could you clarify what you'd like to know?" |
| 19 | Should I proceed with this? | Binary/decision answer; no personality drift. |
| 20 | Is the timing right? | Timing-focused answer; no repetition loop. |
| 21 | **Domain switch:** Ask "What is my life purpose?" then "When will I get married?" | Second answer is marriage domain (timing/compatibility); no purpose paragraph repeated; no "This builds on what we just saw". |
| 22 | (Profile incomplete) Any question requiring chart data | Answer may state incomplete data; UI shows "Insufficient chart data" (or no %), not "32% Confidence". |
| 23 | What mantras or rituals help me? | Remedies (mantra/ritual) answer; no generic clarification if already in remedy domain. |
| 24 | When will my finances improve? | Wealth/timing answer; confidence only when meaningful. |
| 25 | What supports my wealth growth? | Wealth domain; different angle from timing; no repetition loop. |

---

## 25 difficult real-world stress tests (routing + state machine)

Use these to validate domain detection, multi-tool routing, timing vs outcome, location logic, sub-intent continuity, domain switching, remedy lock, psychological vs predictive separation, and ambiguity handling.

| # | Question / theme | Expected outcome |
|---|------------------|------------------|
| 1 | I got a job offer abroad. Should I accept it or wait for something better? | Relocation + decision; no personality lead; no "This cannot be concluded" + error phrase. |
| 2 | I feel stuck professionally. Is this karmic, psychological, or just bad timing? | Purpose or targeted triage (karmic vs psychological vs timing); no single-purpose dump only. |
| 3 | I want to move to Canada, but I'm scared I'll fail. Is this fear real or intuitive? | Relocation or targeted clarification (fear vs intuitive); not generic "Could you clarify... timing, career, relationships...". |
| 4 | My partner wants marriage, but I feel unsure. Is this relationship long-term? | Marriage/relationship answer or single clean profile message; no "I need more information" + "cannot be concluded" + error phrase. |
| 5 | If I launch my app this year, will it scale internationally? | Outcome + timing + location; follow-up "what's the next best date" stays in timing (topic anchor), no generic clarify. |
| 6 | When exactly will my financial situation stabilize? | Timing/wealth answer only; no career personality (10th house, teaching) as body. |
| 7 | Is 2026 better than 2025 for marriage? | Marriage + comparison; single clean message if incomplete; no error phrase. |
| 8 | Why did nothing happen during my "favorable" dasha? | Timing/dasha interpretation answer; not generic "Could you clarify...". |
| 9 | Why do I always sabotage opportunities right before success? | **No** predictive tools; targeted clarification (chart timing vs recurring patterns / professional support). |
| 10 | Is my anxiety about relocation a sign I shouldn't go? | Relocation outcome/timing; no personality-first; no diagnosis. |
| 11 | Am I destined to work alone? | Career/fate answer; no wrong date window or personality-only. |
| 12 | I thrive in Singapore but struggle in India. Why? | Relocation/astrocartography or targeted answer; not generic clarify. |
| 13 | Which is better for long-term wealth: Dubai or London? | Location + wealth (outcome/comparison); no career personality as body. |
| 14 | If I move now, will it be permanent? | Relocation + outcome; not generic clarify. |
| 15 | Is this person my soulmate or a karmic lesson? | **Relationship** (soulmate/karmic); not purpose answer. |
| 16 | Why do I attract emotionally unavailable partners? | Targeted clarification (chart vs patterns/support); no predictive dump. |
| 17 | Will marriage delay my career? | Cross-domain (marriage + career) answer or targeted sub-choice; no career-only clarification. |
| 18 | What is the root cause of my recurring migraines? | Lifestyle/energetic support only; **no** medical diagnosis; disclaimer present. |
| 19 | Should I undergo surgery this year? | Timing/considerations + disclaimer only; no diagnosis; single clean message if insufficient data. |
| 20 | Which gemstone for career growth? → What finger? → What metal? → When to activate? | Remedy lock: all four answered in remedy domain; no reset or re-clarify. |
| 21 | Why does my life feel like a test lately? | Targeted clarification or reflective path; not generic clarify. |
| 22 | What is my Tikkun and how do I complete it? | Identity/Kabbalistic routing or tool pointer; not generic "Could you clarify...". |
| 23 | Does my business align with my soul purpose? | Purpose/alignment answer **only**; no timing window or date in verdict. |
| 24 | Is this good for me? | **Targeted** clarification ("In which area—career, relationship, health?") or short answer; not generic list. |
| 25 | When will it finally happen? | **Targeted** clarification ("When will *what* happen? (e.g. marriage, job change, move.)"); not dasha + error phrase. |

---

## How to run

1. **Manual:** Open Ask the Seer, run each question (and follow-ups in order where indicated). Check response text and confidence badge against the table.
2. **API:** POST to `/api/seer/query` with `query` and optional `sessionState`/history; assert response does not contain banned phrases and (when applicable) that `confidence` and answer text align with "Insufficient chart data" rule.
3. **Automation:** Optional script that sends the 20–25 questions (and follow-up sequences), then checks response bodies for banned substrings and confidence labels.

---

## Banned phrases (must not appear in answers)

- "This builds on what we just saw"
- "Earlier I said"
- "As previously stated"
- "I apologize, but I encountered an error"
- "Please try again." (as the main error message; validator replaces error blocks with "Your chart data is incomplete for this question.")
