import { CREDIT_PACK_DEFS } from '@/lib/billingConfig';
import type { CreditPackId } from '@/lib/billingTypes';

const CREDIT_PACK_IDS: CreditPackId[] = ['starter', 'regular', 'power'];

export type RazorpayCreditOrderForVerification = {
  id?: unknown;
  notes?: unknown;
};

export type CreditOrderVerificationResult =
  | { ok: true; packId: CreditPackId }
  | { ok: false; error: string };

function getNote(notes: unknown, key: string): string | null {
  if (!notes || typeof notes !== 'object') return null;
  const value = (notes as Record<string, unknown>)[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

export function verifyCreditOrderMetadata(params: {
  order: RazorpayCreditOrderForVerification;
  expectedOrderId: string;
  authUid: string;
  requestedPackId: CreditPackId;
}): CreditOrderVerificationResult {
  const orderId = typeof params.order.id === 'string' ? params.order.id : '';
  if (orderId && orderId !== params.expectedOrderId) {
    return { ok: false, error: 'Payment order mismatch' };
  }

  const userId = getNote(params.order.notes, 'userId');
  if (userId !== params.authUid) {
    return { ok: false, error: 'Payment order is not assigned to this user' };
  }

  const packId = getNote(params.order.notes, 'packId') as CreditPackId | null;
  if (!packId || !CREDIT_PACK_IDS.includes(packId)) {
    return { ok: false, error: 'Payment order has invalid credit pack' };
  }

  if (packId !== params.requestedPackId) {
    return { ok: false, error: 'Payment order pack mismatch' };
  }

  const credits = getNote(params.order.notes, 'credits');
  if (credits !== null && Number(credits) !== CREDIT_PACK_DEFS[packId].credits) {
    return { ok: false, error: 'Payment order credit amount mismatch' };
  }

  return { ok: true, packId };
}
