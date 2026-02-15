import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { applyReferralCredit } from '@/lib/referralUtils';

/**
 * POST /api/referrals/apply
 * Apply referral credit to a user (award them a free month)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrerId } = body;

    if (!referrerId) {
      return NextResponse.json(
        { error: 'Referrer ID is required' },
        { status: 400 }
      );
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Apply referral credit (award 1 free month)
    await applyReferralCredit(referrerId, db);

    return NextResponse.json({
      success: true,
      message: 'Referral credit applied successfully'
    });
  } catch (error: any) {
    devLog.error('Error applying referral credit:', error, 'route');
    return NextResponse.json(
      { error: error.message || 'Failed to apply referral credit' },
      { status: 500 }
    );
  }
}
