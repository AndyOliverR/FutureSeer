# Google OAuth branding verification (futureseer.app)

Firebase Auth and Google Sign-In use an OAuth client in **Google Cloud Console**. Google may require **branding verification** before showing your app name (instead of a project id) on the consent screen.

**You cannot complete verification from this repository**—it requires **Google Search Console** (domain proof) and **OAuth consent screen** edits in **Google Cloud Console**. Use this checklist in order.

## Search Console is not Google Cloud Console

- **Search Console:** [search.google.com/search-console](https://search.google.com/search-console) — where you prove you own **`futureseer.app`** with a **DNS TXT** record.
- **Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com) — Firebase, OAuth consent screen, IAM. Searching for `futureseer.app` in Cloud Console does **not** register the domain for OAuth branding.

Your production Firebase **Project ID** is shown under **Firebase → Project settings → General** (for example `futureseer-7abcd5`). The error string `project-534212918149` is a **project number**; branding is still tied to the **same** Firebase project and the **Google account** that owns it.

---

## 1. Search Console — Domain property `futureseer.app` + DNS TXT + account alignment

### 1a. Pick the Google account that must “own” verification

1. In **Cloud Console**, open **IAM & Admin → IAM** (or Firebase **Project settings**) and note which Gmail has **Owner** on your Firebase/GCP project.
2. If you use multiple Chrome profiles or `authuser=0` / `authuser=1`, that **Owner** account should either run Search Console verification **or** be added as **Owner** on the Search Console property (step 1e).

### 1b. Add a Domain property

1. Open [Google Search Console](https://search.google.com/search-console) while signed into the account you chose in 1a (or the account you will add as Owner in 1e).
2. **Add property** → choose **Domain** (not URL prefix).
3. Enter **`futureseer.app`** only (no `https://`, no `www`).
4. Copy the **TXT record** Google shows (value usually starts with `google-site-verification=`).

### 1c. Publish the TXT record where DNS is hosted

DNS lives at your **registrar** or wherever **nameservers** point (e.g. **Vercel**, **Cloudflare**).

#### Vercel-bought domain (path A — preferred for Domain property)

If you **registered `futureseer.app` with Vercel**, Vercel is both **registrar** and **DNS** unless you changed nameservers.

1. **Vercel Dashboard** → **Domains** → select **`futureseer.app`**.
2. Open **DNS Records** (or **Manage** / **Edit** — UI labels vary).
3. Add:
   - **Type:** TXT  
   - **Name / Host:** `@` or root / leave blank (per Vercel’s field labels).  
   - **Value:** the **full** string from Search Console (`google-site-verification=...`) — use **COPY** in the modal.
4. Save, wait for DNS propagation, then **VERIFY** in Search Console.

Basic TXT records for Vercel-registered domains are usually available on the **Hobby** tier; if you see an **Enterprise** message, confirm you are on **Domains → your domain → DNS**, not a different upsell. Contact Vercel support if DNS is blocked.

**Vercel error `value should match format 'ipv4'':** You chose record type **A**. An **A** record’s value must be **only** an IP address (e.g. Vercel’s `76.76.21.21`). Google verification needs type **TXT**, with `google-site-verification=...` in the **Value** field — **not** in **Comment** (comments are not published to DNS). Cancel the A-record attempt, add a **new TXT** row, and keep your existing A/CNAME records that point the site to Vercel.

**Wildcard override warning:** Adding an explicit apex record can affect Vercel wildcards for some subdomains; a **TXT** at `@` is normal. After saving, confirm `www` and any subdomains you use still resolve.

#### Path B — URL-prefix + meta tag (if you cannot add TXT)

1. Search Console → **Add property** → **URL prefix** → e.g. `https://www.futureseer.app` (match your OAuth **Application home page** host).
2. Choose **HTML tag** verification and copy the **`content`** value only (the token string).
3. Set **`GOOGLE_SITE_VERIFICATION`** in **Vercel → Project → Settings → Environment Variables** (Production) to that token — **no** `google-site-verification=` prefix, just the token.
4. Redeploy. Confirm the live page’s `<head>` includes `google-site-verification`.
5. Click **Verify** in Search Console.

**Alternative:** Search Console’s **HTML file** method — download the file Google provides, add it under [`public/`](../public/) with the **exact** filename, deploy, then verify (no env var; do not commit if you prefer a one-off local add only).

Do **not** commit verification secrets into git if you use the **meta tag** path with a hardcoded token; prefer **`GOOGLE_SITE_VERIFICATION`** on Vercel. Remove the env var after verification if you no longer need the meta tag.

For **registrars other than Vercel** (or DNS at Cloudflare, etc.):

1. Add a **TXT** record as Search Console specifies:
   - **Name / Host:** often `@` or blank for the **apex** domain (depends on the provider).
   - **Value:** the full verification string from Search Console.
2. Save. Propagation is often minutes; allow up to 48 hours if needed.
3. Optionally confirm with a public DNS lookup for **TXT** on `futureseer.app` before clicking Verify.

### 1d. Verify

In Search Console, click **Verify**. When the property shows **Verified**, both **apex** and **www** are covered for that Domain property.

### 1e. Two-Gmail fix (cross-account Owner)

If Search Console was verified under one Google account but Firebase **Owner** is another:

1. In Search Console, select the **`futureseer.app`** property.
2. **Settings** (gear) → **Users and permissions** → **Add user**.
3. Add the **Firebase/GCP Owner** email with role **Owner**.

### 1f. Quick checklist (domain step)

| Check | Done when |
|------|-----------|
| Product | Used **Search Console**, not Cloud Console search |
| Property type | **Domain** = `futureseer.app` |
| DNS | TXT visible at public DNS |
| Status | Property **Verified** |
| Accounts | Firebase Owner is Search Console **Owner** (same login or invited Owner) |

## 2. OAuth consent screen — name, domains, homepage

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select your **Firebase** project.
2. Go to **APIs & Services → [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)**.
3. **App information**
   - **App name:** `FutureSeer` (must match public branding on the site—not `project-…`).
   - **User support email:** a monitored address.
4. **App domain**
   - **Application home page:** use your real canonical URL (e.g. `https://www.futureseer.app` or `https://futureseer.app`—match what users see after any redirect).
   - **Privacy policy URL:** must match a **clear link** on your public homepage (see section 4). Use `https://futureseer.app/privacy` or `https://www.futureseer.app/privacy` consistently with the homepage you submit.
5. **Authorized domains:** add **`futureseer.app`** only (no `https://`, no `www`).

**Correct project:** Branding verification is **per GCP project**. Open the consent screen using your **Firebase Project ID** (Firebase → Project settings → General), not an old or staging project:

`https://console.cloud.google.com/apis/credentials/consent?project=YOUR_FIREBASE_PROJECT_ID`  
(Replace with your ID from Firebase, e.g. `futureseer-7abcd5`.)

Click **Save and continue** on **every** step of the consent wizard until finished—do not only save the first card.

### OAuth app name does not match homepage (`project-…` or project number)

Per [App Identity & Branding](https://support.google.com/cloud/answer/13804963?hl=en-GB), the **App name** on the consent screen must match the name on your homepage. A value like `project-534212918149` is a **Google Cloud project number** used as a **default** when **App name** was not set or a **different** project was edited.

**Step-by-step**

1. Open the consent screen with your real Firebase **Project ID** in the URL, for example:  
   `https://console.cloud.google.com/apis/credentials/consent?project=futureseer-7abcd5`  
   Confirm the top bar project picker shows that same project.

2. Click **Edit app** (or **EDIT APP**).

3. Under **App information**, set **App name** to **`FutureSeer`** (same as the site — see [app/layout.tsx](../app/layout.tsx) `applicationName` / `title` and the landing page).

4. Set **User support email** to a monitored address.

5. Click **Save and continue** and complete **every** wizard step (**Audience**, **Contact information**, **Finish**) with no errors.

6. Optional sanity check: start **Google Sign-In** on the live site and confirm the consent dialog title shows **FutureSeer**, not `project-…`. If not, repeat from step 1 with the Project ID from **Firebase → Project settings → General**.

7. **Prepare for verification** / **Submit for verification**, or the email flow **I have fixed the issues** → **Request reverification**.

### After Search Console is verified — resubmit OAuth branding

When section 1 is **Verified** and section 2 matches your live site:

1. Open the same consent screen URL with your real project ID.
2. Confirm **Authorized domains** includes **`futureseer.app`** and **Application home page** matches the final browser URL (with or without `www`).
3. Use **Prepare for verification** / **Submit for verification**, or the email flow **I have fixed the issues** → **Request reverification**.

## 3. Request reverification

From Google’s branding verification email or the consent screen flow, choose **I have fixed the issues** → **Request reverification**. Review may take several business days.

**Submit once:** Address **all** findings (domain, app name, homepage content, policy link) before resubmitting—Google’s docs ask not to resubmit until everything is fixed.

If it still fails, confirm **Authorized domains** ↔ **Search Console verified property** ↔ **Google account** alignment before using **I believe the issues are incorrect**.

## 4. If verification still fails (troubleshooting)

### “Homepage is not registered to you”

Per [App Homepage](https://support.google.com/cloud/answer/13807376?hl=en-GB), the homepage must sit on a **verified** domain. Fixing **Search Console** (section 1) plus **Authorized domains** (section 2) is required; paying a registrar alone is not enough.

### Homepage URL vs redirect

Google expects the consent screen **Application home page** to be a **stable** URL that **matches what appears in the browser** after any redirect (they flag confusing cross-domain redirects).

**Check in a private window:** open `https://www.futureseer.app` and note the **final** URL (with or without `www`). Set **Application home page** to that exact form. This app’s [next.config.mjs](../next.config.mjs) does not define `www` ↔ apex redirects; hosting (e.g. Vercel) may—your console URL must match production behavior.

### App name still shows as `project-…`

Per [App Identity & Branding](https://support.google.com/cloud/answer/13804963?hl=en-GB), the **OAuth consent screen App name** must match the name on your homepage. If reviewers still see a project id, you are likely on the **wrong Cloud project**, the name was **not saved** through the full wizard, or you are reading an **older** verification message.

### Homepage content (policy, no login wall)

Per [App Homepage](https://support.google.com/cloud/answer/13807376?hl=en-GB):

- Users should understand the app **without signing in**.
- The homepage should include an **easily findable** link to the **same** privacy policy URL you put on the consent screen.

The marketing homepage ([app/page.tsx](../app/page.tsx)) includes **FutureSeer** in the hero and footer and links to **`/privacy`** from the hero and [EnhancedFooter](../components/enhanced-footer.tsx).

## Repo alignment

- Root metadata: [app/layout.tsx](../app/layout.tsx) — `applicationName` and title include **FutureSeer**.
- `public/manifest.json` — `short_name`: **FutureSeer**.
- Landing hero: [components/hero-section.tsx](../components/hero-section.tsx) — visible **FutureSeer** product line and **Privacy** policy link.

Keep the **OAuth App name** and **Privacy policy** field in Cloud Console aligned with these.

## References

- [App Homepage (Google Cloud Help)](https://support.google.com/cloud/answer/13807376?hl=en-GB)
- [App Identity & Branding (Google Cloud Help)](https://support.google.com/cloud/answer/13804963?hl=en-GB)
- [OAuth consent screen branding](https://support.google.com/cloud/answer/13807380) (Google)
- [Verify your site (Search Console)](https://support.google.com/webmasters/answer/9008080)
