import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminApiAuth';
import { applyReferralCredit } from '@/lib/referralUtils';
import { devLog } from '@/lib/devLogger';

/**
 * POST /api/referrals/apply
 * Admin-only manual award of a referral free month.
 * Normal awards happen only via trackReferralSignup during authenticated signup.
 */
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminRequest(request, 'referrals-apply');
    if (!adminAuth.ok) {
      return NextResponse.json(
        {
          error:
            'Forbidden. Referral credits are awarded during signup; public apply is disabled.',
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const referrerId = typeof body?.referrerId === 'string' ? body.referrerId.trim() : '';

    if (!referrerId) {
      return NextResponse.json({ error: 'Referrer ID is required' }, { status: 400 });
    }

    await applyReferralCredit(referrerId);

    return NextResponse.json({
      success: true,
      message: 'Referral credit applied successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to apply referral credit';
    devLog.error('Error applying referral credit:', error, 'route');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
