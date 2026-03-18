/**
 * POST /api/profile/record-edit
 * Records one profile edit (save) and returns updated quota. Used after profile save.
 * Header: Authorization: Bearer <Firebase ID token>
 * Response: { count, limit, canGenerate }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDocument, setDocument, isAdminAvailable } from '@/lib/firebase-admin';
import {
  getEditLimit,
  getPeriodStartForReset,
  shouldResetPeriod,
  isPaidPlan,
} from '@/lib/profileEditQuota';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const userDoc = await getDocument('users', uid);
    if (!userDoc) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
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
    let periodStart = typeof user.profileEditPeriodStart === 'number' ? user.profileEditPeriodStart : undefined;

    if (shouldResetPeriod(periodStart, now, isPaid)) {
      periodStart = getPeriodStartForReset(now);
      count = 0;
    }

    count += 1;

    await setDocument('users', uid, {
      profileEditCount: count,
      ...(periodStart != null ? { profileEditPeriodStart: periodStart } : {}),
      updatedAt: Date.now(),
    });

    const canGenerate = count <= limit;
    return NextResponse.json({ count, limit, canGenerate });
  } catch (err) {
    devLog.error('Profile record-edit API error', err, 'record-edit');
    return NextResponse.json({ error: 'Failed to record edit' }, { status: 500 });
  }
}
