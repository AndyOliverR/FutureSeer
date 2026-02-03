# App Store / Play Store readiness

## Remind me later: Mobile and store submission

- Run `pnpm run build:capacitor` and confirm `out/index.html` exists.
- If `ios/` and `android/` are missing: run `pnpm run cap:add:ios`, `pnpm run cap:add:android`, then `pnpm run cap:sync`.
- Do signing and store submission: Xcode (Step 3 in this doc) and Play Console (Step 4).

---

Short checklist for building and submitting FutureSeer to Apple App Store and Google Play Store using Capacitor. For full step-by-step details, see the plan (App Store / Play Store readiness).

---

## 1. How we build for Capacitor (hybrid)

We use a **hybrid** approach so the main web app keeps API routes and SSR on Vercel; only the mobile build does a static export.

- **Default build** (`pnpm run build`): Node server build (`.next/`). Used for Vercel and local `next start`.
- **Capacitor build** (`pnpm run build:capacitor`): Sets `CAPACITOR_BUILD=1` and runs Next.js with `output: 'export'`, producing the `out/` folder. Capacitor’s `webDir` is `out` ([capacitor.config.ts](../capacitor.config.ts)).

The mobile app loads the static bundle from `out/`. API calls go to your deployed backend (e.g. Vercel); configure the app to use the production API base URL when running in the native shell.

**Commands:**

```bash
pnpm run build:capacitor   # Builds static site into out/
pnpm run mobile:build      # build:capacitor + npx cap sync
```

After adding native projects (Step 2), use `pnpm run mobile:build` whenever you change the web app and want to update the iOS/Android builds.

---

## 2. Add native projects (run once)

If `ios/` and `android/` are not yet in the repo:

```bash
pnpm run build:capacitor   # Must produce out/ first
pnpm run cap:add:ios      # npx cap add ios
pnpm run cap:add:android  # npx cap add android
pnpm run cap:sync         # Copy out/ into native projects
```

Check: `ios/` and `android/` exist at the project root. Add them to git or keep in `.gitignore` per your workflow.

---

## 3. Where signing and credentials are stored

- **iOS:** Signing is managed in Xcode (Team, provisioning profiles). Do **not** commit certificates or provisioning profiles to the repo; use Xcode’s “Automatically manage signing” or store credentials in a secrets manager / CI.
- **Android:** The release keystore (e.g. `futureseer-release.keystore`) and passwords must be stored **outside the repo** (e.g. secure machine, secrets manager, or CI secrets). Never commit the keystore or passwords. Document the keystore path and alias for your team (e.g. in a private runbook or 1Password).

---

## 4. Where to set version and build number

- **iOS:** In Xcode: select the project → FutureSeer target → General → Version and Build. Or edit `ios/App/App/Info.plist`: `CFBundleShortVersionString` (user-facing version), `CFBundleVersion` (build number).
- **Android:** In `android/app/build.gradle` (or `build.gradle.kts`): `versionCode` (integer, must increase each upload) and `versionName` (user-facing string).

Bump both before each store upload.

---

## 5. Quick reference

| Action | Command |
|--------|---------|
| Build static site for Capacitor | `pnpm run build:capacitor` |
| Build and sync to native projects | `pnpm run mobile:build` |
| Sync existing native projects | `pnpm run cap:sync` |
| Open iOS project | `npx cap open ios` |
| Open Android project | `npx cap open android` |

For signing, store listings, and submission, follow the full plan (Step 3 iOS, Step 4 Android).
