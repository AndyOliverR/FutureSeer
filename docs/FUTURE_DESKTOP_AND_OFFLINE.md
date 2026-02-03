# Future-ready: Desktop (Electron) and offline storage

This doc describes how to add a **desktop app** (Electron) and **richer offline/local storage** (SQLite or IndexedDB) when you're ready. The repo is already set up so you can do both without large refactors.

---

## Electron (desktop app)

### When to use

Wrap the existing Next.js app as a Windows/macOS/Linux desktop client so users can install FutureSeer like a native app (e.g. from the taskbar or Applications folder).

### How it works today

- **Capacitor** remains the path for **mobile** (iOS/Android); see `capacitor.config.ts`. Electron is **desktop-only**.
- The app runs in Electron by loading the same Next.js app in a `BrowserWindow`. No duplicate code.

### Two ways to run the app in Electron

**Option A – Dev / quick test (recommended for now)**  
Electron loads `http://localhost:3000` after the Next.js server is running.

1. In one terminal: `pnpm run build && pnpm run start` (or `pnpm run dev` for development).
2. In another: `pnpm run electron`.  
   Or use the combined script: `pnpm run desktop` (builds, starts Next, then launches Electron once the server is ready).

**Option B – Distributable desktop app**  
Build a static export of Next.js and load it from the filesystem (or a simple static server) so the desktop app does not depend on a running Next server. Requires:

- Adding `output: 'export'` (or equivalent) to `next.config.mjs` for a static export, **or** serving the built app (e.g. `next start` output) from a local server that Electron starts and points at.
- Packaging with [electron-builder](https://www.electron.build/) (or similar) when you want installers (.exe, .dmg, .AppImage). Not set up in this repo yet; add when you’re ready to ship.

### Where the scaffold lives

- **Main process:** `electron/main.js` – creates the window and loads the app URL.
- **Preload:** `electron/preload.js` – minimal bridge; you can add IPC here later (e.g. for SQLite from the renderer).
- **Entry:** Root `package.json` has `"main": "electron/main.js"` so `electron .` finds the main process.

### Adding SQLite (or other native features) later

When you want a local DB in the desktop app:

1. In the **Electron main process**, add a dependency such as `better-sqlite3` and open a SQLite database.
2. Expose a small API to the renderer via **IPC** (e.g. `ipcMain.handle('storage-get', ...)` / `ipcMain.handle('storage-set', ...)`).
3. In **preload**, use `contextBridge.exposeInMainWorld` to expose that API (e.g. `window.electron.storageGet(key)`).
4. In the **renderer** (Next.js app), use the storage adapter (see below) and plug in an implementation that calls `window.electron.storageGet` / `storageSet` instead of `localStorage`. That way the rest of the app stays the same.

---

## SQLite / offline storage

### Today

- **Web:** [lib/localStorage.ts](lib/localStorage.ts) provides fallback for ask history, notes, and user profile when Firebase is unavailable. Data is stored in the browser’s `localStorage`.
- **Firebase/Firestore** remain the source of truth when online; nothing is replaced with SQLite in this phase.

### When you want larger or richer offline storage

**Web (browser)**  
Options:

- **IndexedDB** – built into browsers; good for larger structured data and blobs. You can implement the same interface as [lib/storageAdapter.ts](lib/storageAdapter.ts) (e.g. `getItem` / `setItem` / `removeItem` / `getAllKeys`) on top of IndexedDB and swap it in.
- **sql.js** – SQLite compiled to WebAssembly; runs in the browser. Same idea: implement the storage adapter interface using sql.js so the rest of the app keeps using the adapter.

**Electron (desktop)**  
Use **better-sqlite3** (or similar) in the **main process** and expose it via IPC, as in the “Adding SQLite later” section above. The renderer then uses the storage adapter with an implementation that talks to the main process (e.g. via `window.electron` APIs from preload).

**Capacitor (mobile)**  
For native mobile offline, use the official [Capacitor SQLite plugin](https://capacitorjs.com/docs/plugins/sqlite) and, if you want one code path, implement the same storage adapter interface so the app can use “local” storage the same way on web, desktop, and mobile.

### Where to plug in a new backend

- The **storage adapter** is in [lib/storageAdapter.ts](lib/storageAdapter.ts). It exposes a small interface (`getItem`, `setItem`, `removeItem`, `getAllKeys`).
- The **default implementation** uses `localStorage`. When you add Electron + SQLite or IndexedDB/sql.js, add a new implementation of that interface (e.g. one that calls IPC or IndexedDB) and use it when running in Electron or when you detect “offline mode” in the browser.
- You can keep using [lib/localStorage.ts](lib/localStorage.ts) for the existing typed helpers (ask history, notes, profile). New code that should work across web/desktop/mobile can use the adapter; existing callers can be moved to the adapter gradually.

---

## Summary

| Goal              | Action                                                                 |
|-------------------|------------------------------------------------------------------------|
| Run app in Electron | Use `pnpm run desktop` or run `pnpm run start` then `pnpm run electron`. |
| Ship desktop installers | Add electron-builder (or similar) and Option B (static or local server). |
| Add SQLite in Electron | Implement DB in main process, expose via IPC/preload, use adapter in renderer. |
| Add IndexedDB/sql.js on web | Implement adapter interface on top of IndexedDB or sql.js; swap in when needed. |
| Mobile offline    | Use Capacitor SQLite plugin; optionally implement same adapter interface. |

No need to do everything at once; this setup is here so you can add desktop and offline when you’re ready.
