import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { validateReferralCode } from '@/lib/referralUtils';

export const dynamic = 'force-static'

/**
 * GET /api/referrals/validate?code=FUTURE_ABC123
 * Validate if a referral code exists and is valid
 */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
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

    // Validate the referral code
    const result = await validateReferralCode(code, db);

    if (result.valid) {
      return NextResponse.json({
        success: true,
        valid: true,
        userId: result.userId,
        message: 'Referral code is valid'
      });
    } else {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Referral code is invalid or not found'
      });
    }
  } catch (error: any) {
    devLog.error('Error validating referral code:', error, 'route');
    return NextResponse.json(
      { error: error.message || 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
