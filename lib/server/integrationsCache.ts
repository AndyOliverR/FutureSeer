/**
 * Tiny in-memory TTL cache for integration API responses (weather, news, etc.).
 * Reduces upstream quota usage; resets on cold start (acceptable for this use case).
 */
export function createTtlCache<K extends string, V>(ttlMs: number) {
  const store = new Map<K, { expires: number; value: V }>();

  return {
    get(key: K): V | undefined {
      const row = store.get(key);
      if (!row) return undefined;
      if (Date.now() > row.expires) {
        store.delete(key);
        return undefined;
      }
      return row.value;
    },
    set(key: K, value: V): void {
      store.set(key, { value, expires: Date.now() + ttlMs });
    },
  };
}
