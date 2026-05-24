# Social schedule + newspaper outreach generator

**Date:** 2026-05-23  
**Status:** Implemented  
**Admin URL:** `/admin/social-posts`

## Goals

1. Align weekly social channel days and post times with 2026 engagement research (IST primary, UTC for diaspora).
2. Add copy-only newspaper/outreach article generator for TOI and editor pitches.
3. Keep Phase B/C-lite model: no auto-publish, manual submission only.

## Social schedule (IST + UTC)

| Day | Channel | Time (IST) | Time (UTC) |
|-----|---------|------------|------------|
| Sun | WhatsApp | 7:00 PM | 13:30 |
| Mon | LinkedIn | 8:30 AM | 03:00 |
| Tue | Threads | 11:00 AM | 05:30 |
| Wed | Facebook | 10:00 AM | 04:30 |
| Thu | X | 9:30 AM | 04:00 |
| Fri | Instagram | 12:30 PM | 07:00 |
| Sat | YouTube Shorts | 4:00 PM | 10:30 |

Sources: Later, Buffer, Sprout Social, Publora (2026). Validate with PostHog/analytics after 4 weeks.

## Newspaper outlets

- TOI Citizen Reporter — civic/human-interest short form
- TOI Blog — op-ed self-publish
- TOI NRI contributor — diaspora story
- Generic press pitch — email to editors
- Guest post pitch — non-promotional proposal

Print classifieds and display ads are **paid only**; generator does not book ads.

## Architecture

- `lib/growth/socialPostSchedule.ts` — IST/UTC formatting
- `lib/growth/socialPostTemplates.ts` — channel meta + post times
- `lib/growth/newspaperOutlets.ts` — outlet definitions + submission URLs
- `lib/growth/newspaperArticleCopyHelpers.ts` — prompts + parsing
- `lib/growth/generateNewspaperArticleCopy.ts` — Groq structured output
- `POST /api/admin/social/generate-newspaper-article` — admin auth
- Admin tabs: Social queue | Newspaper & outreach

## Out of scope

- Auto-submit to TOI APIs
- Paid ad booking integration
- Per-platform auto-scheduling APIs (Phase C full)
