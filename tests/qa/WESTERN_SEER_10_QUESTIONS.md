# Western Seer Retrieval — 10 Messy Questions Checklist

Use this checklist to validate retrieval + persona: answers cite only report sections, no fabricated placements, and missing topics get a clear refusal or "not in your report."

## Prerequisites

- User has a **comprehensive Western report** generated (so `reportChunks` exist in Firestore).
- Ask Western Seer is invoked with that user's `userId` and `westernChartData` (or retrieval path will still work with chunks; chart data required by current API for fallback and refs).

## Test Questions and Expected Primary Section

| # | Question | Expected primary section(s) | Acceptance |
|---|----------|-----------------------------|------------|
| 1 | why am I unlucky in relationships? | relationships, moon, personality | Answer cites 7th house / Venus / Moon from report; calm, interpretive tone; no invented placements. |
| 2 | career feels stuck why? | career, sun, timing | Answer cites career/10th house/Sun from report; no generic advice without chart basis. |
| 3 | is marriage delayed? | relationships, timing, general | Answer from report sections; if timing not in report, "can't be concluded" or similar. |
| 4 | when is a good time to change jobs? | timing, general | Uses timing/transit content from report; no fabricated dates. |
| 5 | what's wrong with my health? | health, moon, general | Uses health/6th/8th house content from report; no medical claims; suggest professional care if appropriate. |
| 6 | am I more fire or water? | personality, sun, moon, ascendant | Based on Big Three / elements from report only. |
| 7 | should I move abroad? | general, timing (or career) | From report if present; else "not in your report" or need relocation/9th house data. |
| 8 | why do I keep attracting the wrong partners? | relationships, moon, personality | From relationship/7th/Venus/Moon sections; interpretive, not blaming. |
| 9 | when will I get promoted? | timing, career | From timing + career sections; no invented dates. |
| 10 | I'm confused about my life direction. | general, personality | Overview from chart/personality; calm, supportive tone. |

## Acceptance Criteria (all questions)

- **Grounding**: Answers cite only report sections (or state "not in your report" / "I'd need X").
- **No fabrication**: No invented placements, aspects, or dates.
- **Tone**: Calm, confident, interpretive (human astrologer).
- **Scope**: Western only; no Vedic/Tarot/gemstone suggestions.
- **Refusal**: For topics astrology shouldn't answer (e.g. death), one short refusal.

## How to run

1. **Manual**: In the app, open Western Astrology, ensure comprehensive report is generated, then ask each question in Ask the Seer and tick the checklist.
2. **API**: POST to `/api/ask-western-seer` with `userId`, `question`, `userProfile`, `westernChartData`; verify response stream content against the table above.

## Optional: expected intent → chunks

For automation, the following mapping is used by `getSectionsForIntent`:

- Q1, Q3, Q8 → relationships → `['relationships', 'moon', 'personality']`
- Q2, Q9 → career → `['career', 'sun', 'timing']`
- Q4, Q9 → timing → `['timing', 'general']`
- Q5 → health → `['health', 'moon', 'general']`
- Q6, Q10 → personality/general → `['general', 'personality']` or `['personality', 'sun', 'moon', 'ascendant']`
- Q7 → general/timing → `['general', 'personality']` or `['timing', 'general']`
