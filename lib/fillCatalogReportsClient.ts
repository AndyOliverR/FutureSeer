/**
 * Client-side drain of POST /api/profile/generate-catalog-batch until the catalog
 * is saved or only exhausted failures remain. Used by Profile Generate and resume.
 */

export type CatalogFillProgress = {
  readyToolsCount: number
  totalTools: number
  allReportsReady: boolean
  catalogFillComplete: boolean
  pendingToolSlugs: string[]
}

export type FillCatalogFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Response>

const DEFAULT_MAX_BATCHES = 80
const BATCH_HTTP_RETRIES = 3

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfterMs(res: Response, data: { retryAfter?: unknown }): number {
  const header = res.headers.get('Retry-After')
  if (header && /^\d+$/.test(header.trim())) {
    return Math.min(60_000, Math.max(1_000, parseInt(header.trim(), 10) * 1000))
  }
  if (typeof data.retryAfter === 'number' && Number.isFinite(data.retryAfter)) {
    return Math.min(60_000, Math.max(1_000, data.retryAfter * 1000))
  }
  return 3_000
}

type BatchJson = {
  error?: string
  allReportsReady?: boolean
  catalogFillComplete?: boolean
  readyToolsCount?: number
  totalTools?: number
  pendingToolSlugs?: string[]
  retryAfter?: number
}

async function postCatalogBatch(
  token: string,
  signal: AbortSignal | undefined,
  fetchImpl: FillCatalogFetch,
): Promise<{ res: Response; data: BatchJson }> {
  const res = await fetchImpl('/api/profile/generate-catalog-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal,
  })
  const data = (await res.json().catch(() => ({}))) as BatchJson
  return { res, data }
}

/**
 * Poll GET generate-mystical until the generation lock is not in-progress.
 */
export async function waitForGenerationLockClear(params: {
  getToken: () => Promise<string>
  signal?: AbortSignal
  fetchImpl?: FillCatalogFetch
  sleep?: (ms: number) => Promise<void>
  maxWaitMs?: number
}): Promise<void> {
  const fetchImpl = params.fetchImpl ?? fetch
  const sleep = params.sleep ?? sleepMs
  const maxWaitMs = params.maxWaitMs ?? 180_000
  const started = Date.now()
  while (Date.now() - started < maxWaitMs) {
    if (params.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const token = await params.getToken()
    const res = await fetchImpl('/api/profile/generate-mystical', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      signal: params.signal,
    })
    const data = (await res.json().catch(() => ({}))) as {
      inProgress?: boolean
      allReportsReady?: boolean
      catalogFillComplete?: boolean
    }
    if (res.ok && !data.inProgress) return
    await sleep(2_000)
  }
  throw new Error('Profile generation is still running. Wait a moment and try Generate again.')
}

/**
 * Call generate-catalog-batch until allReportsReady or catalogFillComplete.
 */
export async function fillRemainingCatalogReports(params: {
  getToken: () => Promise<string>
  signal?: AbortSignal
  onProgress?: (progress: CatalogFillProgress) => void
  fetchImpl?: FillCatalogFetch
  sleep?: (ms: number) => Promise<void>
  maxBatches?: number
}): Promise<CatalogFillProgress> {
  const fetchImpl = params.fetchImpl ?? fetch
  const sleep = params.sleep ?? sleepMs
  const maxBatches = params.maxBatches ?? DEFAULT_MAX_BATCHES
  let progress: CatalogFillProgress = {
    readyToolsCount: 0,
    totalTools: 42,
    allReportsReady: false,
    catalogFillComplete: false,
    pendingToolSlugs: [],
  }

  for (let i = 0; i < maxBatches; i += 1) {
    if (params.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    let lastError: Error | null = null
    let succeeded = false
    for (let attempt = 0; attempt < BATCH_HTTP_RETRIES; attempt += 1) {
      const token = await params.getToken()
      try {
        const { res, data } = await postCatalogBatch(token, params.signal, fetchImpl)
        if (res.status === 429) {
          await sleep(parseRetryAfterMs(res, data))
          lastError = new Error(data.error || 'Rate limited while generating reports.')
          continue
        }
        if (res.status === 503 || res.status === 500) {
          lastError = new Error(data.error || 'Could not generate remaining reports.')
          await sleep(1_000 * (attempt + 1))
          continue
        }
        if (!res.ok) {
          throw new Error(data.error || 'Could not generate remaining reports.')
        }
        progress = {
          readyToolsCount: data.readyToolsCount ?? progress.readyToolsCount,
          totalTools: data.totalTools ?? progress.totalTools,
          allReportsReady: Boolean(data.allReportsReady),
          catalogFillComplete: Boolean(data.catalogFillComplete || data.allReportsReady),
          pendingToolSlugs: Array.isArray(data.pendingToolSlugs) ? data.pendingToolSlugs : [],
        }
        params.onProgress?.(progress)
        succeeded = true
        break
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') throw err
        lastError = err instanceof Error ? err : new Error('Could not generate remaining reports.')
        await sleep(1_000 * (attempt + 1))
      }
    }
    if (!succeeded) {
      throw lastError ?? new Error('Could not generate remaining reports.')
    }
    if (progress.allReportsReady || progress.catalogFillComplete) return progress
  }
  throw new Error('Report generation timed out. Try Generate again.')
}
