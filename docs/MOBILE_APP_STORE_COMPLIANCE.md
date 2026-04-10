# Mobile app store compliance notes (Capacitor)

FutureSeer’s native shells load the production web app ([capacitor.config.ts](../capacitor.config.ts) `server.url`). The following are **product/legal** decisions, not automated guarantees.

## iOS — digital goods and payments (Guideline 3.1.x)

- Subscriptions and digital features purchased **inside** an iOS app are generally expected to use **Apple In-App Purchase**, unless you qualify for a narrow exception (e.g. multiplatform services where users **only** subscribe on the web and the iOS app is ancillary — each case is reviewed by Apple).
- **Razorpay** (or other web checkouts) inside a WebView for **digital** access is a common rejection vector. Options:
  1. **Offer IAP** on iOS for the same entitlements, **or**
  2. Position the iOS app as accessing an account whose **subscription was purchased on the web**, with no purchase UI in the iOS binary (seek legal/App Review–aligned wording).

## iOS — App Tracking Transparency (ATT) and analytics

- If you use [PostHog](../lib/api.ts) (or any SDK) in ways that constitute **tracking** under Apple’s definition (e.g. cross-app/advertising), you must use the **App Tracking Transparency** framework **before** accessing the IDFA, and declare practices accurately in **App Privacy** labels.
- If analytics is **first-party** and not used for third-party ad tracking, you may still need to disclose data collection in App Store Connect; confirm with your privacy counsel.

## Google Play

- **Data safety** form must match actual SDK behavior (analytics, crash reporting, account data).
- **Account deletion**: provide an in-app path or an easy-to-find URL; [Settings → Delete account](../app/settings/page.tsx) and [data deletion](../app/data-deletion/page.tsx) support this story.

## Distributed API rate limits

- Optional Firestore-backed limits: set `RATE_LIMIT_STORE=firestore` in production (requires Firebase Admin). See [lib/rateLimitFirestore.ts](../lib/rateLimitFirestore.ts).
