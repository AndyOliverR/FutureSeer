/**
 * Optional Firestore-backed API rate limits (distributed across serverless instances).
 * Enable with RATE_LIMIT_STORE=firestore and Firebase Admin configured.
 */

import 'server-only';

import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

const COLLECTION = '_apiRateLimits';

export interface RateLimiterLike {
  config: { windowMs: number; maxRequests: number; message?: string };
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number };
  getErrorMessage(): string;
}

export async function checkRateLimitWithOptionalFirestore(
  limiter: RateLimiterLike,
  logicalKey: string,
  identifier: string,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const useFs =
    process.env.RATE_LIMIT_STORE === 'firestore' &&
    adminDb != null &&
    process.env.CAPACITOR_BUILD !== '1';

  if (!useFs) {
    return Promise.resolve(limiter.check(identifier));
  }

  const composite = `${logicalKey}:${identifier}`;
  const docId = createHash('sha256').update(composite).digest('hex').slice(0, 48);
  const ref = adminDb!.collection(COLLECTION).doc(docId);
  const { windowMs, maxRequests } = limiter.config;
  const now = Date.now();

  try {
    return await adminDb!.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const data = snap.data() as
        | { count?: number; resetAt?: number; maxRequests?: number; windowMs?: number }
        | undefined;

      if (!snap.exists || !data?.resetAt || now >= data.resetAt) {
        const resetAt = now + windowMs;
        t.set(ref, {
          logicalKey,
          idHash: createHash('sha256').update(identifier).digest('hex').slice(0, 24),
          count: 1,
          resetAt,
          maxRequests,
          windowMs,
          updatedAt: now,
        });
        return { allowed: true, remaining: maxRequests - 1, resetTime: resetAt };
      }

      const cap = typeof data.maxRequests === 'number' ? data.maxRequests : maxRequests;
      const count = typeof data.count === 'number' ? data.count : 0;
      const resetAt = data.resetAt;

      if (count >= cap) {
        return { allowed: false, remaining: 0, resetTime: resetAt };
      }

      t.update(ref, { count: FieldValue.increment(1), updatedAt: now });
      return {
        allowed: true,
        remaining: cap - count - 1,
        resetTime: resetAt,
      };
    });
  } catch (e) {
    devLog.warn('[rateLimitFirestore] transaction failed, using memory fallback', e, 'rateLimitFirestore');
    return limiter.check(identifier);
  }
}
