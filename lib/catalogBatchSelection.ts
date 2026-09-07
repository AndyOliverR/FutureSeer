/**
 * Pick the next catalog tools to generate, skipping slugs that already failed
 * or returned a terminal placeholder CATALOG_SLUG_MAX_ATTEMPTS times so one
 * LLM error (or a tool that never becomes ready, e.g. faceReading) cannot
 * block the rest of Generate.
 */

export const CATALOG_SLUG_MAX_ATTEMPTS = 3
export const CATALOG_BATCH_SIZE = 2

export type CatalogToolStatusLite = {
  state?: string
  attempts?: number
}

function isTerminalCatalogState(state: string | undefined): boolean {
  return state === 'failed' || state === 'placeholder'
}

export function isCatalogSlugExhausted(
  status: CatalogToolStatusLite | undefined,
  maxAttempts = CATALOG_SLUG_MAX_ATTEMPTS,
): boolean {
  if (!status) return false
  return isTerminalCatalogState(status.state) && (status.attempts ?? 0) >= maxAttempts
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
