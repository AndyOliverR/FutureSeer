import { getDocument, isAdminAvailable } from '@/lib/firebase-admin';
import {
  FinancialHistoryEntrySchema,
  type FinancialHistoryEntry,
  FinancialPostureRatingSchema,
} from '@/lib/financialAstrology/multiAgent/schemas';

function extractStoredAnalysis(doc: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!doc) return null;
  const fa = doc.financialAstrology as Record<string, unknown> | undefined;
  if (!fa || typeof fa !== 'object') return null;
  const inner = fa.comprehensiveAnalysis as Record<string, unknown> | undefined;
  if (inner && typeof inner === 'object') return inner;
  return fa as Record<string, unknown>;
}

/**
 * True when a stored `financialAstrology` tool report has the legacy temperament fields
 * but is missing both the multi-agent posture and any multi-agent diagnostics — i.e. it
 * predates the multi-agent upgrade and should be re-run as a backfill.
 */
export function financialAstrologyNeedsMultiAgentBackfill(toolReport: unknown): boolean {
  if (!toolReport || typeof toolReport !== 'object') return false;
  const rec = toolReport as Record<string, unknown>;
  if (rec.placeholder === true) return false;
  const inner =
    (rec.comprehensiveAnalysis as Record<string, unknown> | undefined) ??
    (rec as Record<string, unknown>);
  if (!inner || typeof inner !== 'object') return false;
  if (!inner.financialTemperamentProfile) return false;
  const hasPosture = inner.posture != null;
  const hasDiagnostics = inner.multiAgentDiagnostics != null;
  return !hasPosture && !hasDiagnostics;
}

/** Load prior posture history for reflection prompts (last entries, capped). */
export async function loadFinancialAstrologyHistory(
  userId: string,
  maxEntries = 5
): Promise<FinancialHistoryEntry[]> {
  if (!userId || !isAdminAvailable()) return [];
  try {
    const doc = (await getDocument('comprehensiveMysticalProfiles', userId)) as Record<
      string,
      unknown
    > | null;
    const analysis = extractStoredAnalysis(doc);
    const raw = analysis?.history;
    if (!Array.isArray(raw)) return [];
    const out: FinancialHistoryEntry[] = [];
    for (const item of raw) {
      const p = FinancialHistoryEntrySchema.safeParse(item);
      if (p.success) out.push(p.data);
    }
    return out.slice(-maxEntries);
  } catch {
    return [];
  }
}

/**
 * Append a history row when multi-agent posture exists. Idempotent if same `generatedAt` already present.
 */
export async function attachFinancialAstrologyHistory(
  userId: string,
  analysis: Record<string, unknown>,
  opts?: { generatedAtForEntry?: string }
): Promise<Record<string, unknown>> {
  const posture = analysis.posture as Record<string, unknown> | undefined;
  if (!posture || typeof posture !== 'object') return analysis;

  const ratingParse = FinancialPostureRatingSchema.safeParse(posture.rating);
  if (!ratingParse.success) return analysis;

  const entryGeneratedAt =
    opts?.generatedAtForEntry ??
    (typeof analysis.generatedAt === 'string' ? analysis.generatedAt : new Date().toISOString());

  const entry: FinancialHistoryEntry = {
    generatedAt: entryGeneratedAt,
    posture: ratingParse.data,
    executiveSummary:
      typeof posture.executiveSummary === 'string'
        ? posture.executiveSummary.slice(0, 800)
        : '',
  };

  let prev: FinancialHistoryEntry[] = [];
  if (userId && isAdminAvailable()) {
    prev = await loadFinancialAstrologyHistory(userId, 10);
  }

  const withoutDup = prev.filter((h) => h.generatedAt !== entry.generatedAt);
  const next = [...withoutDup, entry].slice(-5);

  return { ...analysis, history: next };
}
