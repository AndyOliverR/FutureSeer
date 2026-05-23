/**
 * Optional Firestore-backed AI circuit breaker (shared across serverless instances).
 * Enable with AI_CIRCUIT_STORE=firestore and Firebase Admin configured.
 */

import 'server-only';

import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

const COLLECTION = '_aiCircuitBreaker';
const DEFAULT_PROVIDER_KEY = 'global';

const FAILURE_THRESHOLD = 5;
const RECOVERY_MS = 30_000;

export interface CircuitBreakerDoc {
  consecutiveFailures?: number;
  openUntil?: number | null;
  updatedAt?: number;
}

function firestoreCircuitStoreEnabled(): boolean {
  return (
    process.env.AI_CIRCUIT_STORE === 'firestore' &&
    adminDb != null &&
    process.env.CAPACITOR_BUILD !== '1'
  );
}

export function isDistributedCircuitBreakerEnabled(): boolean {
  return firestoreCircuitStoreEnabled();
}

function circuitOpenError(): Error & { code: string; status: number } {
  const err = new Error(
    'AI service is temporarily unavailable. Please try again in a moment.',
  ) as Error & { code: string; status: number };
  err.code = 'AI_CIRCUIT_OPEN';
  err.status = 503;
  return err;
}

export async function assertDistributedCircuitClosed(
  providerKey: string = DEFAULT_PROVIDER_KEY,
): Promise<void> {
  if (!firestoreCircuitStoreEnabled()) return;

  const ref = adminDb!.collection(COLLECTION).doc(providerKey);
  const now = Date.now();

  try {
    const snap = await ref.get();
    const data = snap.data() as CircuitBreakerDoc | undefined;
    const openUntil = typeof data?.openUntil === 'number' ? data.openUntil : null;

    if (openUntil != null && now < openUntil) {
      throw circuitOpenError();
    }

    if (openUntil != null && now >= openUntil) {
      await ref.set(
        {
          openUntil: null,
          consecutiveFailures: 0,
          updatedAt: now,
        },
        { merge: true },
      );
    }
  } catch (e) {
    if ((e as { code?: string })?.code === 'AI_CIRCUIT_OPEN') {
      throw e;
    }
    devLog.warn('[aiCircuitBreakerStore] read failed, allowing request', e, 'aiCircuitBreakerStore');
  }
}

export async function recordDistributedCircuitSuccess(
  providerKey: string = DEFAULT_PROVIDER_KEY,
): Promise<void> {
  if (!firestoreCircuitStoreEnabled()) return;

  const ref = adminDb!.collection(COLLECTION).doc(providerKey);
  try {
    await ref.set(
      {
        consecutiveFailures: 0,
        openUntil: null,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  } catch (e) {
    devLog.warn('[aiCircuitBreakerStore] success write failed', e, 'aiCircuitBreakerStore');
  }
}

export async function recordDistributedCircuitFailure(
  providerKey: string = DEFAULT_PROVIDER_KEY,
): Promise<void> {
  if (!firestoreCircuitStoreEnabled()) return;

  const ref = adminDb!.collection(COLLECTION).doc(providerKey);
  const now = Date.now();

  try {
    await adminDb!.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const data = snap.data() as CircuitBreakerDoc | undefined;
      const openUntil = typeof data?.openUntil === 'number' ? data.openUntil : null;

      if (openUntil != null && now < openUntil) {
        return;
      }

      let failures = typeof data?.consecutiveFailures === 'number' ? data.consecutiveFailures : 0;
      if (openUntil != null && now >= openUntil) {
        failures = 1;
      } else {
        failures += 1;
      }

      const next: CircuitBreakerDoc = {
        consecutiveFailures: failures,
        updatedAt: now,
      };

      if (failures >= FAILURE_THRESHOLD) {
        next.openUntil = now + RECOVERY_MS;
        devLog.warn(
          `Distributed AI circuit opened (${failures} failures)`,
          undefined,
          'aiCircuitBreakerStore',
        );
      }

      t.set(ref, next, { merge: true });
    });
  } catch (e) {
    devLog.warn('[aiCircuitBreakerStore] failure transaction failed', e, 'aiCircuitBreakerStore');
  }
}

export async function isDistributedCircuitOpen(
  providerKey: string = DEFAULT_PROVIDER_KEY,
): Promise<boolean> {
  if (!firestoreCircuitStoreEnabled()) return false;

  try {
    const snap = await adminDb!.collection(COLLECTION).doc(providerKey).get();
    const data = snap.data() as CircuitBreakerDoc | undefined;
    const openUntil = typeof data?.openUntil === 'number' ? data.openUntil : null;
    return openUntil != null && Date.now() < openUntil;
  } catch {
    return false;
  }
}
