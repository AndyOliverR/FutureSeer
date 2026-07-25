import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';
import { CREDIT_COSTS, CREDIT_PACK_DEFS } from '@/lib/billingConfig';
import { hasUnlimitedBillingAccess } from '@/lib/billingAccess';
import {
  creditBalanceFromProfile,
  isFreeInstanceAvailable,
  markFreeInstanceConsumed,
  normalizeFreeUseConsumed,
} from '@/lib/billingFreeUse';
import type {
  BillingAction,
  BillingUserFields,
  ConsumeBillingResult,
  CreditPackId,
} from '@/lib/billingTypes';

function userBillingFromData(data: FirebaseFirestore.DocumentData | undefined): BillingUserFields {
  if (!data) return {};
  return {
    email: typeof data.email === 'string' ? data.email : undefined,
    billingMode: data.billingMode === 'payg' || data.billingMode === 'subscription' ? data.billingMode : null,
    creditBalance: typeof data.creditBalance === 'number' ? data.creditBalance : 0,
    freeUseConsumed: normalizeFreeUseConsumed(data.freeUseConsumed),
    creditOrderIds: Array.isArray(data.creditOrderIds)
      ? data.creditOrderIds.filter((x): x is string => typeof x === 'string')
      : [],
    noChargeAccount: data.noChargeAccount === true,
    mysticalProfileGenerated: data.mysticalProfileGenerated === true,
    subscriptionStatus: typeof data.subscriptionStatus === 'string' ? data.subscriptionStatus : undefined,
    selectedPlan: typeof data.selectedPlan === 'string' ? data.selectedPlan : undefined,
    paymentMethodId: typeof data.paymentMethodId === 'string' ? data.paymentMethodId : undefined,
  };
}

export async function getBillingSnapshot(userId: string): Promise<{
  creditBalance: number;
  billingMode: 'payg' | 'subscription';
  unlimited: boolean;
  freeUseConsumed: ReturnType<typeof normalizeFreeUseConsumed>;
}> {
  if (!adminDb) {
    return { creditBalance: 0, billingMode: 'payg', unlimited: false, freeUseConsumed: {} };
  }
  const snap = await adminDb.collection('users').doc(userId).get();
  const profile = userBillingFromData(snap.data());
  const unlimited = hasUnlimitedBillingAccess(profile);
  return {
    creditBalance: creditBalanceFromProfile(profile),
    billingMode: unlimited ? 'subscription' : profile.billingMode === 'subscription' ? 'subscription' : 'payg',
    unlimited,
    freeUseConsumed: normalizeFreeUseConsumed(profile.freeUseConsumed),
  };
}

/**
 * Atomically consume credits or a one-time free instance before an AI / regen action.
 */
export async function consumeBillingAction(
  userId: string,
  action: BillingAction,
  opts?: { toolSlug?: string },
): Promise<ConsumeBillingResult> {
  if (!adminDb) {
    devLog.warn('[billing] admin unavailable — allowing action without debit', { userId, action }, 'billing');
    return {
      ok: true,
      charged: false,
      creditsCharged: 0,
      creditBalance: 0,
      usedFreeInstance: false,
    };
  }

  const cost = CREDIT_COSTS[action];
  const toolSlug = opts?.toolSlug?.trim() || undefined;
  const userRef = adminDb.collection('users').doc(userId);
  const ledgerRef = userRef.collection('billingLedger').doc();

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) {
        return {
          ok: false as const,
          code: 'insufficient_credits' as const,
          creditBalance: 0,
          creditsRequired: cost,
        };
      }

      const profile = userBillingFromData(snap.data());
      if (hasUnlimitedBillingAccess(profile)) {
        return {
          ok: true as const,
          charged: false,
          creditsCharged: 0,
          creditBalance: creditBalanceFromProfile(profile),
          usedFreeInstance: false,
        };
      }

      const freeUse = normalizeFreeUseConsumed(profile.freeUseConsumed);
      if (isFreeInstanceAvailable(action, freeUse, toolSlug)) {
        const nextFree = markFreeInstanceConsumed(action, freeUse, toolSlug);
        const balance = creditBalanceFromProfile(profile);
        tx.set(
          userRef,
          {
            freeUseConsumed: nextFree,
            billingMode: profile.billingMode ?? 'payg',
            updatedAt: Date.now(),
          },
          { merge: true },
        );
        tx.set(ledgerRef, {
          type: 'free_instance',
          action,
          toolSlug: toolSlug ?? null,
          delta: 0,
          balanceAfter: balance,
          createdAt: Date.now(),
        });
        return {
          ok: true as const,
          charged: false,
          creditsCharged: 0,
          creditBalance: balance,
          usedFreeInstance: true,
        };
      }

      const balance = creditBalanceFromProfile(profile);
      if (balance < cost) {
        return {
          ok: false as const,
          code: 'insufficient_credits' as const,
          creditBalance: balance,
          creditsRequired: cost,
        };
      }

      const nextBalance = balance - cost;
      tx.set(
        userRef,
        {
          creditBalance: nextBalance,
          billingMode: profile.billingMode ?? 'payg',
          updatedAt: Date.now(),
        },
        { merge: true },
      );
      tx.set(ledgerRef, {
        type: 'debit',
        action,
        toolSlug: toolSlug ?? null,
        delta: -cost,
        balanceAfter: nextBalance,
        createdAt: Date.now(),
      });

      return {
        ok: true as const,
        charged: true,
        creditsCharged: cost,
        creditBalance: nextBalance,
        usedFreeInstance: false,
      };
    });
  } catch (e) {
    devLog.error('[billing] consume transaction failed', { userId, action, e }, 'billing');
    return {
      ok: false,
      code: 'insufficient_credits',
      creditBalance: 0,
      creditsRequired: cost,
    };
  }
}

/**
 * Credit a verified pack purchase. `packId` must come from server-side Razorpay
 * order notes — never from an untrusted client body field alone.
 * Global `creditOrderRedemptions/{orderId}` prevents cross-account replay.
 */
export async function addCreditsFromPack(
  userId: string,
  packId: CreditPackId,
  orderId: string,
  paymentId: string,
): Promise<{ success: boolean; creditsAdded: number; creditBalance: number; duplicate?: boolean }> {
  if (!adminDb) {
    throw new Error('Database not available');
  }

  const pack = CREDIT_PACK_DEFS[packId];
  if (!pack) throw new Error('Invalid credit pack');

  const userRef = adminDb.collection('users').doc(userId);
  const ledgerRef = userRef.collection('billingLedger').doc();
  const redemptionRef = adminDb.collection('creditOrderRedemptions').doc(orderId);

  return adminDb.runTransaction(async (tx) => {
    // Reads must complete before any writes in a Firestore transaction.
    const snap = await tx.get(userRef);
    const redemptionSnap = await tx.get(redemptionRef);
    if (!snap.exists) throw new Error('User not found');

    const data = snap.data() ?? {};
    const balance = creditBalanceFromProfile(userBillingFromData(data));
    const existingOrders: string[] = Array.isArray(data.creditOrderIds)
      ? data.creditOrderIds.filter((x): x is string => typeof x === 'string')
      : [];

    if (redemptionSnap.exists) {
      const redeemedBy = redemptionSnap.data()?.userId;
      if (typeof redeemedBy === 'string' && redeemedBy !== userId) {
        throw new Error('This payment was already redeemed by another account');
      }
      return {
        success: true,
        creditsAdded: 0,
        creditBalance: balance,
        duplicate: true,
      };
    }

    if (existingOrders.includes(orderId)) {
      // Legacy same-user idempotency before global markers existed.
      tx.set(
        redemptionRef,
        {
          userId,
          packId,
          paymentId,
          credits: pack.credits,
          createdAt: Date.now(),
          legacyBackfill: true,
        },
        { merge: true },
      );
      return {
        success: true,
        creditsAdded: 0,
        creditBalance: balance,
        duplicate: true,
      };
    }

    const nextBalance = balance + pack.credits;
    const now = Date.now();

    tx.set(
      redemptionRef,
      {
        userId,
        packId,
        paymentId,
        credits: pack.credits,
        createdAt: now,
      },
      { merge: false },
    );
    tx.set(
      userRef,
      {
        creditBalance: nextBalance,
        billingMode: 'payg',
        creditOrderIds: FieldValue.arrayUnion(orderId),
        lastCreditPurchaseAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
    tx.set(ledgerRef, {
      type: 'credit_purchase',
      packId,
      orderId,
      paymentId,
      delta: pack.credits,
      balanceAfter: nextBalance,
      createdAt: now,
    });

    return { success: true, creditsAdded: pack.credits, creditBalance: nextBalance };
  });
}
