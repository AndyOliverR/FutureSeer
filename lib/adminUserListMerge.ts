import 'server-only';

import type { Firestore } from 'firebase-admin/firestore';
import { fetchUserDocsByUid } from '@/lib/adminUserFirestore';
import {
  computeAdminUserFunnelFields,
  type AdminUserFunnelFields,
} from '@/lib/adminUserJourneyTypes';

export type AdminListUserRecord = Record<string, unknown> & {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  disabled?: boolean;
  claims?: Record<string, unknown>;
};

export const ADMIN_USER_FUNNEL_CSV_HEADERS = [
  'uid',
  'email',
  'displayName',
  'disabled',
  'subscriptionStatus',
  'nextBillingDate',
  'profileComplete',
  'mysticalReady',
  'profileStatus',
  'activeToday',
  'lastSeenAt',
  'lastSeenRoute',
] as const;

function mergeFunnelIntoUser(
  user: AdminListUserRecord,
  data: Record<string, unknown> | undefined,
): AdminListUserRecord & AdminUserFunnelFields {
  const funnel = computeAdminUserFunnelFields(data);
  const nextBillingDate = data?.nextBillingDate;
  return {
    ...user,
    ...funnel,
    nextBillingDate:
      nextBillingDate !== undefined && nextBillingDate !== null ? nextBillingDate : null,
    subscriptionId:
      typeof data?.subscriptionId === 'string' ? data.subscriptionId : user.subscriptionId,
  };
}

/** Attach Firestore journey funnel fields to Auth user rows (list + export). */
export async function mergeFirestoreFunnelIntoAdminUsers(
  db: Firestore,
  users: AdminListUserRecord[],
): Promise<Array<AdminListUserRecord & AdminUserFunnelFields>> {
  if (users.length === 0) return [];
  const uids = users.map((u) => u.uid);
  const byUid = await fetchUserDocsByUid(db, uids);
  return users.map((u) => mergeFunnelIntoUser(u, byUid[u.uid]));
}

export function adminUserToCsvRow(user: AdminListUserRecord & Partial<AdminUserFunnelFields>): string {
  return ADMIN_USER_FUNNEL_CSV_HEADERS.map((h) => {
    const v = user[h];
    if (v === undefined || v === null) return '';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  }).join(',');
}
