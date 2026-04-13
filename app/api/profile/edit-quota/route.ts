/**
 * GET /api/profile/edit-quota
 * Returns current profile edit quota status (count, limit, canGenerate). Does not increment.
 * Header: Authorization: Bearer <Firebase ID token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDocument, isAdminAvailable } from '@/lib/firebase-admin';
import {
  getEditLimit,
  shouldResetPeriod,
  isPaidPlan,
} from '@/lib/profileEditQuota';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (!isAdminAvailable()) {
      return NextResponse.json({ count: 0, limit: 5, canGenerate: true });
    }

    const userDoc = await getDocument('users', uid);
    if (!userDoc) {
      return NextResponse.json({ count: 0, limit: 5, canGenerate: true });
    }

    const user = userDoc as Record<string, unknown>;
    const isSpecialUser =
      user.specialUser === true ||
      user.special_user === true ||
      user.isSpecialUser === true;
    if (isSpecialUser) {
      return NextResponse.json({
        count: 0,
        limit: 999999,
        canGenerate: true,
      });
    }
    const email = (user.email ?? user.Email) as string | undefined;
    if (isNoChargeSubscriptionEmail(email)) {
      return NextResponse.json({
        count: 0,
        limit: 8,
        canGenerate: true,
      });
    }

    const selectedPlan = (user.selectedPlan ?? user.selected_plan) as string | undefined;
    const limit = getEditLimit(selectedPlan);
    const isPaid = isPaidPlan(selectedPlan);
    const now = new Date();
    let count = typeof user.profileEditCount === 'number' ? user.profileEditCount : 0;
    const periodStart = typeof user.profileEditPeriodStart === 'number' ? user.profileEditPeriodStart : undefined;

    if (shouldResetPeriod(periodStart, now, isPaid)) {
      count = 0;
    }

    // Launch hotfix: free users should not be blocked from generation by edit quota.
    // Keep returning count/limit for telemetry and future re-enforcement.
    const canGenerate = true;
    return NextResponse.json({ count, limit, canGenerate });
  } catch (err) {
    devLog.error('Profile edit-quota API error', err, 'edit-quota');
    return NextResponse.json({ count: 0, limit: 5, canGenerate: true });
  }
}
