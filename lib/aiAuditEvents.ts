/**
 * Append-only AI control-layer audit events (Firestore `aiCallEvents`).
 * Server-only — complements token usage in `aiInferenceEvents`.
 */

import 'server-only';

import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';
import type { StructuredFailureMode } from '@/lib/aiStructuredOutputParse';
import type { AiReportSource } from '@/lib/aiFallbackRouter';

export type AiCallKind = 'structured' | 'text' | 'stream' | 'gate_block';

export interface AiAuditEventPayload {
  label: string;
  kind: AiCallKind;
  route?: string;
  userId?: string | null;
  attempts: number;
  failureMode: StructuredFailureMode | 'gate_block' | string;
  passed: boolean;
  latencyMs: number;
  fallbackSource?: AiReportSource;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  guardReason?: string;
  /** Semantic injection score when guard blocks (tune INJECTION_BLOCK_SCORE from aiCallEvents). */
  injectionScore?: number;
  injectionReasons?: string[];
}

/** Fire-and-forget; never throws to callers. */
export function recordAiAuditEvent(payload: AiAuditEventPayload): void {
  if (!adminDb) return;
  const row = {
    timestamp: new Date().toISOString(),
    environment:
      process.env.VERCEL_ENV ||
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.NODE_ENV ||
      'unknown',
    ...payload,
  };
  void adminDb
    .collection('aiCallEvents')
    .add(row)
    .catch((e) => {
      devLog.warn('[aiAuditEvents] Failed to record event', e, 'aiAuditEvents');
    });
}

export async function withAiAudit<T>(
  payload: Omit<AiAuditEventPayload, 'passed' | 'latencyMs' | 'failureMode' | 'attempts'> & {
    attempts: number;
    failureMode: AiAuditEventPayload['failureMode'];
  },
  fn: () => Promise<T>,
  isSuccess: (result: T) => boolean,
): Promise<T> {
  const started = Date.now();
  try {
    const result = await fn();
    recordAiAuditEvent({
      ...payload,
      passed: isSuccess(result),
      latencyMs: Date.now() - started,
    });
    return result;
  } catch (err) {
    recordAiAuditEvent({
      ...payload,
      passed: false,
      latencyMs: Date.now() - started,
      failureMode: payload.failureMode === 'none' ? 'provider_error' : payload.failureMode,
    });
    throw err;
  }
}
