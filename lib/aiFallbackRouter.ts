/**
 * Ordered fallback for comprehensive / Firestore-backed AI reports.
 * LLM (with control-layer retries) → stale Firestore cache → deterministic chart data.
 */

import { devLog } from '@/lib/devLogger';
import { recordAiAuditEvent } from '@/lib/aiAuditEvents';
import type { StructuredReportRunResult } from '@/lib/aiStructuredOutput';
import { parseLlmJsonRecord } from '@/lib/aiStructuredOutputParse';
import type { StructuredFailureMode } from '@/lib/aiStructuredOutputParse';

export type AiReportSource =
  | 'llm'
  | 'firestore_cache'
  | 'question_cache'
  | 'deterministic'
  | 'none';

export interface LlmReportAttempt<T> {
  data: T | null;
  attempts: number;
  failureMode: StructuredFailureMode;
  parsingFailed?: boolean;
}

/** Map a structured report AI run to typed data (null when parse/normalize fails). */
export function mapStructuredReportRun<T>(
  aiRun: StructuredReportRunResult,
  map: (raw: Record<string, unknown>) => T,
): LlmReportAttempt<T> {
  const tryMap = (raw: Record<string, unknown> | null | undefined): T | null => {
    if (!raw) return null;
    try {
      return map(raw);
    } catch {
      return null;
    }
  };

  const fromRaw = tryMap(aiRun.raw ?? undefined);
  if (fromRaw) {
    return { data: fromRaw, attempts: aiRun.attempts, failureMode: 'none' };
  }

  const recovered = aiRun.lastRaw ? parseLlmJsonRecord(aiRun.lastRaw) : null;
  const fromRecovered = tryMap(recovered);
  if (fromRecovered) {
    return {
      data: fromRecovered,
      attempts: aiRun.attempts,
      failureMode: aiRun.failureMode,
    };
  }

  return {
    data: null,
    attempts: aiRun.attempts,
    failureMode: aiRun.failureMode,
    parsingFailed: true,
  };
}

export interface ResolveAiReportOptions<T> {
  label: string;
  userId?: string;
  tryLlm: () => Promise<LlmReportAttempt<T>>;
  /** Last good cached report (may ignore freshness TTL when used as fallback). */
  readFirestoreCache?: () => Promise<T | null>;
  buildDeterministic: () => T;
}

export interface ResolveAiReportResult<T> {
  data: T;
  source: AiReportSource;
  degraded: boolean;
  attempts: number;
  failureMode: StructuredFailureMode;
  parsingFailed?: boolean;
}

/**
 * Resolves report data without throwing — always returns usable `data` when deterministic is provided.
 */
export async function resolveAiReportWithFallback<T>(
  options: ResolveAiReportOptions<T>,
): Promise<ResolveAiReportResult<T>> {
  const { label, userId, tryLlm, readFirestoreCache, buildDeterministic } = options;
  const started = Date.now();

  const llm = await tryLlm();
  if (llm.data) {
    recordAiAuditEvent({
      label,
      kind: 'structured',
      userId,
      attempts: llm.attempts,
      failureMode: llm.failureMode,
      passed: true,
      latencyMs: Date.now() - started,
      fallbackSource: 'llm',
    });
    return {
      data: llm.data,
      source: 'llm',
      degraded: false,
      attempts: llm.attempts,
      failureMode: llm.failureMode,
      parsingFailed: llm.parsingFailed,
    };
  }

  if (readFirestoreCache) {
    try {
      const cached = await readFirestoreCache();
      if (cached) {
        devLog.warn(
          `[${label}] using Firestore cache fallback after LLM failure (${llm.failureMode})`,
          undefined,
          'aiFallbackRouter',
        );
        recordAiAuditEvent({
          label,
          kind: 'structured',
          userId,
          attempts: llm.attempts,
          failureMode: llm.failureMode,
          passed: true,
          latencyMs: Date.now() - started,
          fallbackSource: 'firestore_cache',
        });
        return {
          data: cached,
          source: 'firestore_cache',
          degraded: true,
          attempts: llm.attempts,
          failureMode: llm.failureMode,
          parsingFailed: llm.parsingFailed,
        };
      }
    } catch (e) {
      devLog.warn(`[${label}] Firestore cache fallback read failed`, e, 'aiFallbackRouter');
    }
  }

  devLog.warn(
    `[${label}] using deterministic fallback after LLM failure (${llm.failureMode})`,
    undefined,
    'aiFallbackRouter',
  );
  const data = buildDeterministic();
  recordAiAuditEvent({
    label,
    kind: 'structured',
    userId,
    attempts: llm.attempts,
    failureMode: llm.failureMode,
    passed: true,
    latencyMs: Date.now() - started,
    fallbackSource: 'deterministic',
  });
  return {
    data,
    source: 'deterministic',
    degraded: true,
    attempts: llm.attempts,
    failureMode: llm.failureMode,
    parsingFailed: llm.parsingFailed ?? true,
  };
}
