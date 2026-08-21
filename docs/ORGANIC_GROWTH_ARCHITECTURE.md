# Organic growth architecture — FutureSeer

**Goal:** Users discover FutureSeer without ₹10k/month agency fees or daily manual posting. Two engines:

1. **You distribute** — scheduled, on-brand posts to owned channels (API-based, not password bots).
2. **Users distribute** — shareable result cards from the mystical profile (viral loop).

**Single message (pick one everywhere):**  
*"One birth chart. 50+ traditions. One AI Seer that only speaks from your saved reports."*

Do not lead with “AI + astrology + numerology + tarot + …” in public copy.

---

## What already exists in the repo

| Asset | Location | Use for growth |
|--------|----------|----------------|
| Tool share cards | `components/report-viral/ShareCard.tsx`, `TeaserView` | Pattern for golden branded cards |
| Mystical snippets | `lib/mysticalProfilePositiveSnippet.ts`, tool pages / share card panel | Source text for user share cards |
| App referral share | `components/ShareAppModal.tsx` | Referral links (`?ref=`) |
| Analytics | `lib/analytics.ts` (PostHog) | Track shares, signups, `ref` |
| Marketing workflow | [MARKETING_AND_ASSET_WORKFLOW.md](./MARKETING_AND_ASSET_WORKFLOW.md) | Voice, assets, channels |

**Gap:** No server-side social scheduler, no mystical-profile **image** export, no post copy pipeline.

---

## Strategy 1 — Owned-channel automation (replace agency)

### Do **not** build “username + password in the app”

- Violates Meta, Google, LinkedIn, X Terms of Service; accounts get banned.
- Credential storage is a security and legal liability (especially for a consumer app).
- WhatsApp **personal status** has **no official API** for “post my status every Sunday” from a server.

### Do build: **Social scheduler (admin-only, OAuth / API tokens)**

| Piece | Approach |
|--------|----------|
| **Auth** | Long-lived tokens per platform (Meta Page token for FB/IG/Threads, YouTube refresh token, LinkedIn OAuth, X API v2). Stored in Vercel env / Firestore `_socialPublisher` **encrypted**, never in client. |
| **Content** | Groq generates post from a **template + capability bullet** (reuse AI control layer). Human approves in admin UI **or** auto-post only pre-approved templates. |
| **Schedule** | Vercel Cron → `POST /api/admin/social/publish-due` (protected by admin secret). |
| **Aggregator option** | [Ayrshare](https://www.ayrshare.com/) / Buffer API — one integration, many networks (~$29–99/mo vs ₹10k agency). Faster to ship than 6 native integrations. |

### Suggested weekly calendar (your plan)

| Day | Channel | Post type |
|-----|---------|-----------|
| Sun | WhatsApp | **Manual** status image + link (or WhatsApp Business broadcast to opt-in list only) |
| Mon | Facebook Page `FutureSeer.App` | Capability carousel / myth-bust |
| Tue | Threads | Short hook + link |
| Wed | Instagram | Reel script + static card |
| Thu | YouTube | Short description + community post (Shorts need upload API or manual) |
| Fri | LinkedIn | Professional “unified divination stack” angle |
| Sat | X | Curiosity hook + link |

**Reality check:** YouTube Shorts and WhatsApp Status are the weakest for full automation; keep **manual or semi-manual** (generate copy + image in admin, one-tap copy).

### Channels ↔ your handles (reference only — store tokens in env, not in git)

- Site: `https://futureseer.app`
- FB Page: FutureSeer.App  
- IG / Threads: andyoliverrozario  
- X: @andyrozario  
- LinkedIn: andyoliverrozario  
- YouTube: multiple channels — pick **one primary** for Shorts to avoid dilution  

---

## Strategy 2 — User share cards (highest ROI, build in-app)

### Product behavior

1. On **Mystical Profile** (after generation), show **“Share your cosmic card”**.
2. Card shows:
   - User-facing title (e.g. archetype / top strength from `buildMysticalCardSnippet`)
   - 1–2 positive lines (already extracted)
   - **Glowing gold** `futureseer.app` footer (brand, not user name)
3. Actions: **Download PNG**, **Share** (`navigator.share` with image), **Copy link** (`futureseer.app?ref=UID`).
4. Optional: “Share to unlock deeper report on [tool]” — reuse `report-viral` pattern on 1–2 flagship tools.

### Technical outline

```
lib/growth/mysticalShareCard.ts     — pick title + lines from profile
components/growth/MysticalShareCard.tsx — UI + html-to-canvas or @vercel/og
app/api/og/mystical-share/route.tsx   — optional server-rendered OG image (1200×630)
```

Track events: `share_card_view`, `share_card_download`, `share_card_native_share`, `signup_with_ref`.

### Why this beats daily posting

- One post reaches **your** followers.  
- One shared card reaches **their** followers with social proof.  
- Identity content (“My hidden archetype: …”) spreads; “Try our app” does not.

---

## 30-day compounding plan (~15–20 min/day)

| Week | Focus | Daily habit |
|------|--------|-------------|
| **1** | Ship mystical share card + `ref` tracking | Fix analytics funnel only |
| **2** | 1 curiosity short/day (template) | Hook → 3 bullets → “Check yours → FutureSeer” |
| **3** | 2 community answers/day (no spam) | Reddit / FB groups / Quora — helpful first |
| **4** | One habit feature tease | Daily score / lucky number if not shipped yet |

**Ignore** vanity metrics (likes). Watch: signups, `ref` conversions, share_card events, D1 return.

---

## SEO (low daily effort, long tail)

Static or SSR tools under `/tools/...` or `/free/...`:

- Life path calculator  
- Moon sign calculator  
- Angel number 111 / 222 pages  

One page can bring users for years; one IG post dies in 24h.

---

## Implementation phases (engineering)

| Phase | Scope | Effort | Replaces agency? |
|-------|--------|--------|------------------|
| **A** | Mystical profile share card (PNG + share + gold brand) | 3–5 days | Partially (user-led growth) |
| **B** | Admin post generator + copy templates (no auto-post) | 2–3 days | Cuts content time |
| **C** | Cron + Ayrshare (or Meta Graph) auto-publish | 5–8 days | Replaces SocialIntern for API-supported networks |
| **D** | Referral unlock on 2 tools | 2–4 days | Compounds A |
| **E** | SEO calculator landing pages | Ongoing | Discovery |

**Recommended order:** **A → B → C** (user viral first, then your automation).

---

## Cost comparison

| Option | Monthly | Notes |
|--------|---------|--------|
| SocialIntern + MONK PIXELS | ~₹10,000 | Manual + opaque |
| Ayrshare + in-house cron + Groq copy | ~$30–100 + API | You control calendar & brand |
| Phase A only (user shares) | Dev time once | Zero recurring if no aggregator |

---

## Security & compliance

- No user passwords for social accounts in Firestore or env committed to git.  
- Admin routes: `verifyIdToken` + admin claim only.  
- Occult/AI claims: follow [MARKETING_AND_ASSET_WORKFLOW.md](./MARKETING_AND_ASSET_WORKFLOW.md) — no guaranteed predictions in posts.  
- WhatsApp: only **opt-in** marketing (user consented); no cold messaging from app servers.

---

## Next decision (owner)

1. Confirm **one-liner** message (above or variant).  
2. Choose Phase **A** (share cards) and/or **C** (scheduler).  
3. For automation: **Ayrshare** (fast) vs **native Meta + YouTube APIs** (more control, more work).  
4. WhatsApp Sunday: accept **manual** status with app-generated image + caption copy button in admin.

**Phase A (shipped):** Share card UI in `components/growth/MysticalShareCardPanel.tsx` + `MysticalShareCardVisual.tsx`. Payload from `lib/growth/mysticalShareCard.ts`. `/mystical-profile` is a bookmark redirect to `/tools`; cards render on tool/report surfaces.

**Phase B (shipped):** Admin copy-only post generator at `/admin/social-posts` (link from Admin Dashboard → Support Tools). Templates in `lib/growth/socialPostTemplates.ts` (weekly channel calendar). Groq via `lib/growth/generateSocialPostCopy.ts` + `POST /api/admin/social/generate-post` (`verifyAdminRequest`, `callStructuredAI`, JSON fields: headline, primary, bullets, hashtags, cta, notes). UI: `components/admin/SocialPostGenerator.tsx` — per-field and “copy all”. No auto-publish.

**Phase C-lite (shipped, $0):** Weekly queue UI (`components/admin/WeeklySocialQueue.tsx`) + scheduler deep links (`lib/growth/socialSchedulerLinks.ts`). Optional Monday checklist email: `SOCIAL_WEEKLY_DIGEST_EMAIL` + `RESEND_API_KEY`, cron `GET /api/cron/weekly-social-digest` (Mondays 08:00 UTC), manual `POST /api/admin/social/send-weekly-digest`. Email is a checklist with links to generate copy — not batch AI. Skip Ayrshare ($149+/mo) for own-brand posting; use Meta Business Suite + LinkedIn native schedulers.
