# Notifications & Cron Setup

How to get and set `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, and `CRON_SECRET` for local development and Vercel production.

---

## 1. RESEND_API_KEY

**Where to get it**

1. Go to [resend.com](https://resend.com) and sign up or sign in.
2. Open **API Keys**: [resend.com/api-keys](https://resend.com/api-keys).
3. Click **Create API Key**, name it (e.g. "FutureSeer"), choose permission (e.g. **Sending access**).
4. Copy the key (starts with `re_`). You only see it once; store it safely.

**How to set it**

- **Local:** In your project root, open or create `.env.local` and add:
  ```bash
  RESEND_API_KEY=re_your_actual_key_here
  ```
- **Vercel:** Project → **Settings** → **Environment Variables** → Add `RESEND_API_KEY` with the same value, for Production (and Preview if you want cron in preview).

---

## 2. NOTIFICATION_FROM_EMAIL (sender address only)

**What it is**

The **sender (from) address** for notification emails. This is the only thing that involves Resend domains. It has nothing to do with CRON_SECRET (that’s in section 3).

**Options**

- **Resend test domain (easiest):** Use `onboarding@resend.dev`. No setup; works as soon as you have an API key. Good for local/dev.
- **Your own domain:** Resend recommends sending from a **subdomain**, not the root domain (see [Subdomain vs root domain](https://resend.com/docs/knowledge-base/is-it-better-to-send-emails-from-a-subdomain-or-the-root-domain)):
  - **Use a subdomain**, e.g. `notifications@notifications.yourdomain.com` or `hello@mail.yourdomain.com` (better for reputation and deliverability).
  - **Avoid** the root, e.g. `notifications@yourdomain.com`.
  Add and verify the (sub)domain in Resend: **Domains** → **Add Domain** → add the DNS records they show.

**How to set it**

- **Local:** In `.env.local`:
  ```bash
  NOTIFICATION_FROM_EMAIL=onboarding@resend.dev
  ```
  or your verified subdomain address (e.g. `notifications@notifications.yourdomain.com`).
- **Vercel:** Add `NOTIFICATION_FROM_EMAIL` in Environment Variables with the same value you use in production.

---

## 3. CRON_SECRET (not related to Resend or email)

**What it is**

A secret string used to **secure the cron API route** (so only Vercel or you can call it). Vercel sends it as `Authorization: Bearer <CRON_SECRET>` when it triggers the job. This has nothing to do with Resend, email addresses, or domains—it’s just a password for your cron endpoint.

**Where to get it**

Generate a random string. Examples:

- **PowerShell (Windows):**
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
  ```
- **Node (any OS):**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Or use any password generator (32+ characters, random).

**How to set it**

- **Local:** In `.env.local`:
  ```bash
  CRON_SECRET=your_generated_secret_here
  ```
  Use the same value when testing the cron route locally (e.g. Postman or curl with `Authorization: Bearer <CRON_SECRET>`).

- **Vercel (important):**
  1. Project → **Settings** → **Environment Variables**.
  2. Add name: `CRON_SECRET`.
  3. Value: the **same** secret you used locally (or a new one; just use the same in the route and here).
  4. Select **Production** (and **Preview** if you want cron in preview).
  5. Save.

When `CRON_SECRET` is set in Vercel, Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when it hits your cron URL. No extra config needed.

---

## Quick checklist

| Step | Local (`.env.local`) | Vercel (Settings → Environment Variables) |
|------|----------------------|-------------------------------------------|
| 1 | Add `RESEND_API_KEY=re_...` | Add `RESEND_API_KEY` (same value) |
| 2 | Add `NOTIFICATION_FROM_EMAIL=onboarding@resend.dev` (or your domain) | Add `NOTIFICATION_FROM_EMAIL` (same value) |
| 3 | Generate a secret, add `CRON_SECRET=...` | Add `CRON_SECRET` with the **same** value |

Redeploy on Vercel after adding or changing env vars. The daily insights cron runs at 9:00 UTC (see `vercel.json`).
