import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { generateReferralCode } from '@/lib/referralUtils';
import { resolveOwnedUserId, verifyUserRequest } from '@/lib/userApiAuth';
import { devLog } from '@/lib/devLogger';

/**
 * POST /api/referrals/generate
 * Generate a referral code for the authenticated user (if they don't have one).
 * Header: Authorization: Bearer <Firebase ID token>
 * Body: { userId: string } — must match the authenticated UID.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'referrals-generate');
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const ownedUserId = resolveOwnedUserId(body?.userId, auth.uid);

    if (!ownedUserId) {
      return NextResponse.json(
        { error: 'User ID is required and must match authenticated user' },
        { status: 403 },
      );
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const userRef = db.collection('users').doc(ownedUserId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (userData?.referralCode) {
      return NextResponse.json({
        success: true,
        referralCode: userData.referralCode,
        message: 'Existing referral code retrieved',
      });
    }

    const referralCode = generateReferralCode(ownedUserId);

    await userRef.set(
      {
        referralCode,
        updatedAt: Date.now(),
      },
      { merge: true },
    );

    return NextResponse.json({
      success: true,
      referralCode,
      message: 'Referral code generated successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate referral code';
    devLog.error('Error generating referral code:', error, 'route');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
