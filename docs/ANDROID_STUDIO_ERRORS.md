# Android Studio errors – how to fix or report them

## Command-line build status

From the project root, these should succeed:

- **Build:** `cd android && .\gradlew.bat assembleDebug` (Windows) or `./gradlew assembleDebug` (macOS/Linux)
- **Lint:** `cd android && .\gradlew.bat lint`

If both pass, the project compiles and lints correctly. Errors you see **only in Android Studio** are usually IDE/sync issues, not code errors.

## What we already fixed (in this repo)

- **Gradle deprecation:** Replaced `android.dependency.excludeLibraryComponentsFromConstraints=true` with `android.dependency.useConstraints=false` in `android/gradle.properties` (AGP 10 compatibility).
- **flatDir warning:** The app uses `flatDir` for Capacitor plugin libs; the warning is expected and can be ignored unless you move plugins to a Maven repository.
- **Android Lint / Inspections (app-owned only):**
  - **AndroidManifest:** `<uses-permission>` moved before `<application>`; `tools:targetApi="24"` added so `networkSecurityConfig` is not flagged on minSdk 23.
  - **Dependencies:** Updated in `variables.gradle`: appcompat 1.7.1, coordinatorlayout 1.3.0, core-splashscreen 1.2.0, junit 1.3.0, espresso 3.7.0; root `build.gradle`: google-services 4.4.4.
  - **Root build.gradle:** Replaced deprecated `task clean(type: Delete)` with `tasks.register("clean", Delete)` and `layout.buildDirectory`; fixed unused catch parameter in app `build.gradle`.
  - **Lint:** In app `build.gradle`, disabled `UnusedResources` (Capacitor uses activity_main, bridge_layout_main, etc.) and icon density/duplicate checks for splash and drawable.
  - **Adaptive icons:** Added `<monochrome>` to `ic_launcher.xml` and `ic_launcher_round.xml` (points to foreground drawable).

Inspections that reference **Capacitor, Firebase Auth, or other plugins** (e.g. `GoogleAuthProviderHandler.java`, `FirebaseAuthentication.java`, `Bridge.java`, deprecations in `Plugin`, etc.) live in `node_modules`. We do not edit those; they are fixed upstream or can be suppressed in the IDE.

## If Android Studio still shows errors

1. **Sync and invalidate caches**
   - **File → Sync Project with Gradle Files**
   - **File → Invalidate Caches… → Invalidate and Restart**

2. **Export the exact errors** (so Cursor or Gemini can fix them)
   - Open **Build** or **Problems** tool window.
   - Copy the full error text (message + file + line), or
   - **File → Export to…** if your Android Studio version can export the problem list to a file.
   - Paste or attach that list when asking for help.

3. **Who should fix it**
   - **Cursor (here):** Paste or attach the error list in this chat; we can edit the repo and fix build/config issues.
   - **Gemini:** You can give Gemini the same exported error list; it can suggest fixes. Prefer one assistant so changes stay consistent.

## Runtime log messages (logcat)

When you run the app on a device or emulator, logcat shows many lines. Here’s what the ones you’re seeing mean and whether they need a fix.

### Safe to ignore (no app change)

| Log | Why it’s OK |
|-----|-------------|
| **ClipboardService: Denying clipboard access … application is not in focus** | Android 10+ only allows clipboard access when the app is in focus. If the user switched away or the app tried to access clipboard in the background, the system denies it. We only write to the clipboard on user action; the app now checks focus before writing to reduce this. |
| **InputDispatcher: Channel is unrecoverably broken and will be disposed** | Normal when the activity/window is being torn down (app closed, back press, or process killed). The system is cleaning up the input channel. |
| **chromium: opendir … HTTP Cache/Code Cache … No such file or directory** | WebView’s disk cache path is missing or was cleared (e.g. after an update or cache clear). Chromium logs this when enumerating cache; it recreates as needed. No app fix required. |
| **chromium: Could not get file info for … Code Cache/js/…** | Same as above: cache files were removed or not yet created. Benign. |
| **Simple Cache Backend: cache directory inaccessible right after creation** | WebView cache directory timing on first run or after clear. Usually one-off. |
| **Unexpected CPU variant for x86: x86_64** | Emulator CPU variant message. Not an app bug. |
| **Failed to find entry 'classes.dex'** | Comes from WebView/Trichrome loader, not from our APK. Ignore. |
| **ashmem: Pinning is deprecated since Android Q** | From system/WebView libraries. We can’t change it. |
| **BLUETOOTH_CONNECT permission / getBluetoothAdapter() requires BLUETOOTH** | WebView/Chromium may use Bluetooth for WebRTC. We don’t use that; the warning is harmless. Adding the permission would only silence the log. |
| **MESA / libc / vendor.mesa.* / rendernode** | Emulator GPU/graphics. Not app code. |
| **Seed missing signature / Failed to open file for reading** (variations_seed_loader) | Chromium tries to load a variations seed; in WebView it’s often missing. Benign. |
| **Skipped N frames! … doing too much work on its main thread** | First load or heavy UI can cause jank. General performance topic; not a single “fix” in this doc. |
| **Davey! duration=…** | Frame took longer than 700 ms. Same as above; optimize heavy work later if needed. |

### Known / documented (no fix or optional)

| Log | What it is | Action |
|-----|------------|--------|
| **Capacitor: Unable to read file at path public/plugins** | With `server.url` (e.g. dev at `http://10.0.2.2:3000`), the native bridge may still try to read a plugins manifest from the filesystem. In dev the app loads from the URL, so this file isn’t used. | Optional: run `npx cap sync` so `public/` has the expected structure; otherwise ignore in dev. |
| **FirebaseAuthentication: No user is signed in. (Fix with AI)** | The Capacitor Firebase Auth plugin subscribes to auth state at startup and calls `getIdToken()`; when no user is signed in it logs this. It’s from the plugin, not our app code. | No change in our repo; the app still works. |
| **layout.css was preloaded using link preload but not used within a few seconds** | Next.js injects a preload for the layout CSS; in the WebView it can be reported as unused. We already suppress this in the in-page console; it can still appear in logcat because the WebView logs before our script runs. | No app fix required; cosmetic. |

### What we fixed or improved

- **Clipboard:** All clipboard writes use `safeCopyToClipboard()` (focus check + try/catch), including share/copy in ShareAppModal, ReferralCodeCard, AboutReferral, useSettings, and every Vedic chart “copy link” fallback (DivisionalChartsViewer, DashaTimelineViewer, TransitsOverlay, RasiChartViewer, ConvertedChartsViewer). This reduces “Denying clipboard access” when the app isn’t in focus.

If you see a **new** log line that isn’t in the table above, paste it and we can classify or fix it.

## Quick checklist

- [ ] Run `.\gradlew.bat assembleDebug` and `.\gradlew.bat lint` from `android/` – both succeed?
- [ ] Synced Gradle and invalidated caches in Android Studio?
- [ ] If errors remain, exported/copied the exact error messages to share?
