# Resend Inbound: Receive support emails at support@futureseer.app

When customers (or Razorpay) email **support@futureseer.app**, Resend receives the email and sends a webhook to the app. The app stores the email in Firestore and can forward a copy to your personal inbox.

## What’s in the codebase

- **Webhook route:** `app/api/webhooks/resend-inbound/route.ts`
  - Verifies the webhook with `RESEND_WEBHOOK_SECRET`
  - On `email.received`, stores the email in Firestore collection `inbound_emails`
  - If `SUPPORT_FORWARD_EMAIL` is set, sends a copy of the email to that address via Resend

- **Env vars** (see `env-template.txt`):
  - `RESEND_WEBHOOK_SECRET` – from Resend when you create the webhook (required for verification)
  - `SUPPORT_FORWARD_EMAIL` – optional; your personal email to receive a copy of every support email

## What you do in Resend

1. **Turn on Inbound for your domain**
   - Log in at [Resend](https://resend.com) → **Domains**
   - Open the domain you use for sending (e.g. **futureseer.app**)
   - Ensure **Receiving** is enabled for that domain (Resend will show MX and any other records if needed)
   - If you haven’t set up receiving yet, add the MX (and any other) records Resend shows so that mail to `*@futureseer.app` is received by Resend

2. **Create a webhook for inbound emails**
   - In Resend: **Webhooks** → **Add webhook**
   - **Endpoint URL:** `https://futureseer.app/api/webhooks/resend-inbound` (use your production URL)
   - **Events:** enable **email.received**
   - Save; Resend will show a **Signing secret** (starts with `whsec_`)
   - Copy that value into your env as `RESEND_WEBHOOK_SECRET` (e.g. in Vercel project settings)

3. **Set env in production**
   - In Vercel (or your host): add `RESEND_WEBHOOK_SECRET` and, if you want a copy in your inbox, `SUPPORT_FORWARD_EMAIL` (e.g. your Gmail).

After that, any email sent to **support@futureseer.app** will:
- Be received by Resend
- Trigger the webhook to your app
- Be stored in Firestore `inbound_emails`
- Be forwarded to `SUPPORT_FORWARD_EMAIL` (if set)

## Razorpay

You’ve already set **support@futureseer.app** in Razorpay Customer Support Details. No change needed there; those emails will be received by Resend and processed by this webhook once Resend Inbound and the webhook are configured as above.
