import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { generateReferralCode } from '@/lib/referralUtils';

/**
 * POST /api/referrals/generate
 * Generate a referral code for a user (if they don't have one)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Server-side: Use Admin SDK
    if (typeof window === 'undefined') {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      // If user already has a referral code, return it
      if (userData?.referralCode) {
        return NextResponse.json({
          success: true,
          referralCode: userData.referralCode,
          message: 'Existing referral code retrieved'
        });
      }

      // Generate new referral code
      const referralCode = generateReferralCode(userId);

      // Update user profile with referral code
      await userRef.update({
        referralCode: referralCode,
        updatedAt: Date.now()
      });

      return NextResponse.json({
        success: true,
        referralCode: referralCode,
        message: 'Referral code generated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Client-side not supported for this endpoint' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}
