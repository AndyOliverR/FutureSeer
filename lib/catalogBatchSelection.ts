/**
 * Pick the next catalog tools to generate, skipping slugs that already failed
 * CATALOG_SLUG_MAX_ATTEMPTS times so one LLM error cannot block the rest.
 */

export const CATALOG_SLUG_MAX_ATTEMPTS = 3
export const CATALOG_BATCH_SIZE = 2

export type CatalogToolStatusLite = {
  state?: string
  attempts?: number
}

export function isCatalogSlugExhausted(
  status: CatalogToolStatusLite | undefined,
  maxAttempts = CATALOG_SLUG_MAX_ATTEMPTS,
): boolean {
  if (!status) return false
  return status.state === 'failed' && (status.attempts ?? 0) >= maxAttempts
}

export function selectRunnableCatalogSlugs(
  pendingToolSlugs: readonly string[],
  toolStatus: Record<string, CatalogToolStatusLite> | undefined,
  batchSize = CATALOG_BATCH_SIZE,
): { batch: string[]; exhausted: string[] } {
  const exhausted: string[] = []
  const runnable: string[] = []
  for (const slug of pendingToolSlugs) {
    if (isCatalogSlugExhausted(toolStatus?.[slug])) {
      exhausted.push(slug)
      continue
    }
    runnable.push(slug)
  }
  return {
    batch: runnable.slice(0, Math.max(1, batchSize)),
    exhausted,
  }
}
