import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ userId: '_' }]
}

// GET - Fetch and calculate user referral statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      
      // Try to find referrals in user profile or separate referrals collection
      // First, check if there's a referrals collection
      let referralsSnapshot;
      try {
        referralsSnapshot = await db.collection('referrals')
        .where('referrerId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      } catch (error) {
        // Collection might not exist, check user profile instead
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          // Check if user profile has referral tracking
          const referralCode = userData!.referralCode || userId;
          
          // Find users who signed up with this referral code
          const referredUsersSnapshot = await db.collection('users')
            .where('referredBy', '==', referralCode)
            .get();
          
          referralsSnapshot = referredUsersSnapshot;
        } else {
          referralsSnapshot = { docs: [], empty: true, size: 0 };
        }
      }

      // Calculate referral statistics
      let totalInvites = 0;
      let successfulSignups = 0;
      let pendingInvites = 0;
      let lastInviteDate: string | null = null;

      if (!referralsSnapshot.empty && referralsSnapshot.docs) {
        totalInvites = referralsSnapshot.docs.length;
        
        // Count successful signups (users who actually signed up)
        for (const doc of referralsSnapshot.docs) {
          const data = doc.data();
          
          // Check if this is a user document or referral document
          if (data.uid || data.email) {
            // This is a user document - count as successful signup
            successfulSignups++;
            const createdAt = data.createdAt || data.creationTime || data.createdAt;
            if (createdAt) {
              const inviteDate = createdAt.toDate?.()?.toISOString() || new Date(createdAt).toISOString();
              if (!lastInviteDate || inviteDate > lastInviteDate) {
                lastInviteDate = inviteDate;
              }
            }
          } else if (data.status) {
            // This is a referral document
            if (data.status === 'completed' || data.status === 'signed-up') {
              successfulSignups++;
            } else if (data.status === 'pending') {
              pendingInvites++;
            }
            
            const createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt;
            if (createdAt && (!lastInviteDate || createdAt > lastInviteDate)) {
              lastInviteDate = createdAt;
            }
          }
        }
      }

      // Alternative: Check for referral tracking in user profile
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // If we don't have referral data from referrals collection, check user profile
        if (totalInvites === 0 && userData) {
          // Check if there's a share link or referral code that was used
          // For now, we'll use the share link pattern: ?ref=userId
          // Users who signed up with this ref should have referredBy field
          const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://futureseer.app'}?ref=${userId}`;
          
          // Find users who have this userId in their referredBy field
          try {
            const referredUsersSnapshot = await db.collection('users')
              .where('referredBy', '==', userId)
              .get();
            
            totalInvites = referredUsersSnapshot.size;
            successfulSignups = referredUsersSnapshot.size;
            
            if (referredUsersSnapshot.size > 0) {
              type TimestampLike = { toDate?: () => Date } | Date | string | number;
              referredUsersSnapshot.docs.forEach((doc: { data: () => Record<string, unknown> }) => {
                const data = doc.data();
                const createdAt = (data.createdAt ?? data.creationTime) as TimestampLike | undefined;
                if (createdAt != null) {
                  const inviteDate = (typeof createdAt === 'object' && createdAt !== null && typeof (createdAt as { toDate?: () => Date }).toDate === 'function')
                    ? (createdAt as { toDate: () => Date }).toDate().toISOString()
                    : new Date(createdAt as string | number).toISOString();
                  if (!lastInviteDate || inviteDate > lastInviteDate) {
                    lastInviteDate = inviteDate;
                  }
                }
              });
            }
          } catch (error) {
            // referredBy field might not exist or index might not be set up
            devLog.info('Referral tracking not fully set up:', error, 'community');
          }
        }
      }

      return NextResponse.json({
        success: true,
        referralStats: {
          totalInvites,
          successfulSignups,
          pendingInvites,
          lastInviteDate,
        },
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error fetching user referrals:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to fetch user referrals' }, { status: 500 });
  }
}

