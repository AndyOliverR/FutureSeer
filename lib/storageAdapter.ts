/**
 * Storage adapter: key-value local storage abstraction.
 *
 * Default implementation uses the browser's localStorage (or Electron renderer).
 * You can swap in a different implementation later without changing callers:
 *
 * - **Electron**: Implement an adapter that uses IPC to the main process, where
 *   better-sqlite3 (or similar) is used. Expose via preload (e.g. window.electron.storageGet/set).
 * - **Web (larger offline)**: Implement using IndexedDB or sql.js (SQLite in WASM).
 * - **Capacitor (mobile)**: Implement using the Capacitor SQLite plugin.
 *
 * See docs/FUTURE_DESKTOP_AND_OFFLINE.md for the full path.
 */

export interface IStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Default implementation using localStorage.
 * Safe to use in browser and in Electron renderer (which has access to localStorage).
 */
const defaultAdapter: IStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (!isBrowser()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota or security; ignore
    }
  },

  async removeItem(key: string): Promise<void> {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },

  async getAllKeys(): Promise<string[]> {
    if (!isBrowser()) return [];
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k) keys.push(k);
      }
      return keys;
    } catch {
      return [];
    }
  },
};

let currentAdapter: IStorageAdapter = defaultAdapter;

/**
 * Replace the storage backend (e.g. for Electron IPC or IndexedDB).
 * Call this once at app init when running in Electron or when using a custom backend.
 */
export function setStorageAdapter(adapter: IStorageAdapter): void {
  currentAdapter = adapter;
}

/**
 * Get the current storage adapter (for tests or to restore default).
 */
export function getStorageAdapter(): IStorageAdapter {
  return currentAdapter;
}

export const storageAdapter: IStorageAdapter = {
  getItem: (key) => currentAdapter.getItem(key),
  setItem: (key, value) => currentAdapter.setItem(key, value),
  removeItem: (key) => currentAdapter.removeItem(key),
  getAllKeys: () => currentAdapter.getAllKeys(),
};
