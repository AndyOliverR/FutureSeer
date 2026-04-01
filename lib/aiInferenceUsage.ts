/**
 * Firestore-backed inference usage logging and optional Seer daily token caps.
 * Server-only (uses Firebase Admin).
 */

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

export interface InferenceUsagePayload {
  route: string;
  model: string;
  userId?: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function utcDayString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Append-only audit row (query in Firebase Console or admin tools). */
export async function recordInferenceUsage(payload: InferenceUsagePayload): Promise<void> {
  if (!adminDb) return;
  try {
    await adminDb.collection('aiInferenceEvents').add({
      timestamp: new Date().toISOString(),
      environment:
        process.env.VERCEL_ENV ||
        process.env.NEXT_PUBLIC_VERCEL_ENV ||
        process.env.NODE_ENV ||
        'unknown',
      ...payload,
    });
  } catch (e) {
    devLog.warn('[aiInferenceUsage] Failed to record event', e, 'aiInferenceUsage');
  }
}

const DAILY_DOC = 'aiInferenceDaily';

/**
 * Increment today's Seer token total for a user (UTC day boundary).
 * Called after a successful Seer completion when usage is present.
 */
export async function incrementSeerDailyTokens(
  userId: string,
  totalTokens: number
): Promise<void> {
  if (!adminDb || !userId || totalTokens <= 0) return;
  const day = utcDayString();
  const ref = adminDb.collection(DAILY_DOC).doc(userId);
  try {
    await adminDb.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const data = snap.data() as { day?: string; seerTokens?: number } | undefined;
      if (!data?.day || data.day !== day) {
        t.set(ref, { day, seerTokens: totalTokens, updatedAt: Date.now() });
      } else {
        t.update(ref, {
          seerTokens: FieldValue.increment(totalTokens),
          updatedAt: Date.now(),
        });
      }
    });
  } catch (e) {
    devLog.warn('[aiInferenceUsage] incrementSeerDailyTokens failed', e, 'aiInferenceUsage');
  }
}

function parseCap(envVal: string | undefined): number | null {
  if (envVal == null || String(envVal).trim() === '') return null;
  const n = Number.parseInt(String(envVal).trim(), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Returns an error message if the user has exceeded today's Seer token cap, else null.
 * Caps are optional (unset env = no cap).
 */
export async function checkSeerDailyTokenCap(
  userId: string | null | undefined,
  isPaid: boolean
): Promise<string | null> {
  if (!userId || !adminDb) return null;
  const cap = parseCap(
    isPaid
      ? process.env.SEER_DAILY_TOKEN_CAP_PAID
      : process.env.SEER_DAILY_TOKEN_CAP_FREE
  );
  if (cap == null) return null;

  const day = utcDayString();
  try {
    const snap = await adminDb.collection(DAILY_DOC).doc(userId).get();
    const data = snap.data() as { day?: string; seerTokens?: number } | undefined;
    if (!data || data.day !== day) return null;
    const used = typeof data.seerTokens === 'number' ? data.seerTokens : 0;
    if (used >= cap) {
      return isPaid
        ? 'Daily Seer usage limit reached for your plan. Try again tomorrow or contact support.'
        : 'Daily Seer usage limit reached. Sign in with a paid plan for a higher limit, or try again tomorrow.';
    }
  } catch (e) {
    devLog.warn('[aiInferenceUsage] checkSeerDailyTokenCap read failed', e, 'aiInferenceUsage');
  }
  return null;
}
