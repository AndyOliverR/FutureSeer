# App Store / Play Store readiness

## Remind me later: Mobile and store submission

- **Android (v1):** Capacitor WebView loads **`https://futureseer.app`** (remote-hosted). Run `npx cap sync android` after changing [capacitor.config.ts](../capacitor.config.ts).
- Optional: `pnpm run build:capacitor` when using static export workflows; not required for the remote-WebView Play build.
- If `ios/` and `android/` are missing: run `pnpm run cap:add:ios`, `pnpm run cap:add:android`, then `npx cap sync`.
- Do signing and store submission: Xcode (Step 3 in this doc) and Play Console (Step 4).

---

Short checklist for building and submitting FutureSeer to Apple App Store and Google Play Store using Capacitor.

---

## 1. How we build for Capacitor (hybrid)

We use a **hybrid** approach: the canonical app runs on **Vercel** (Next.js + `/api` routes). The **Android app (v1)** uses Capacitor’s **remote URL** so the WebView loads the same site as production—**relative `/api/...` calls work** without a full static bundle in the APK.

- **Default build** (`pnpm run build`): Node server build (`.next/`). Used for Vercel and local `next start`.
- **Optional static export** (`pnpm run build:capacitor` with `output: 'export'` in Next config, if you add it): produces `out/` for fully offline-capable bundles; would require `webDir` + API base URL alignment. **Not** the current Android shipping path.

**Commands:**

```bash
npx cap sync android   # After editing capacitor.config.ts — copy config into android/
pnpm run mobile:build    # optional: build:capacitor + cap sync (when using static export)
```

---

## 2. Add native projects (run once)

If `ios/` and `android/` are not yet in the repo:

```bash
npx cap add ios
npx cap add android
npx cap sync
```

Check: `ios/` and `android/` exist at the project root. Add them to git or keep in `.gitignore` per your workflow.

---

## 3. Where signing and credentials are stored

- **iOS:** Signing is managed in Xcode (Team, provisioning profiles). Do **not** commit certificates or provisioning profiles to the repo; use Xcode’s “Automatically manage signing” or store credentials in a secrets manager / CI.
- **Android:** The release keystore (e.g. `futureseer-upload-key.jks` under `android/app/`) and passwords must be stored **outside the repo** (e.g. secure machine, secrets manager, or CI secrets). Never commit the keystore or passwords. [android/.gitignore](../android/.gitignore) ignores `*.jks` / `*.keystore`. Document the keystore path and alias for your team (e.g. in a private runbook or 1Password).

---

## 4. Where to set version and build number

- **iOS:** In Xcode: select the project → FutureSeer target → General → Version and Build. Or edit `ios/App/App/Info.plist`: `CFBundleShortVersionString` (user-facing version), `CFBundleVersion` (build number).
- **Android:** In `android/app/build.gradle`: `versionCode` (integer, must increase each upload) and `versionName` (user-facing string).

Bump both before each store upload.

---

## 5. Quick reference

| Action | Command |
|--------|---------|
| Sync Capacitor to Android | `npx cap sync android` |
| Build and sync (when using static export) | `pnpm run mobile:build` |
| Sync existing native projects | `npx cap sync` |
| Open iOS project | `npx cap open ios` |
| Open Android project | `npx cap open android` |

For signing, store listings, and submission, follow the full plan (Step 3 iOS, Step 4 Android).
