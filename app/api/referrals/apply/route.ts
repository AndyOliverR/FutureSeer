import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
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

    await applyReferralCredit(referrerId);

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
