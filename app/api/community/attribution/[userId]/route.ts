import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { devLog } from '@/lib/devLogger';

// GET - Aggregate user attribution data (contributions + referrals + impact)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      
      // Fetch contributions
      let contributions: any[] = [];
      let impactScore = 0;
      let implementedCount = 0;
      
      try {
        let contributionsSnapshot;
        try {
          contributionsSnapshot = await db.collection('communityContributions')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        } catch (error: any) {
          // Handle missing index error gracefully
          if (error.code === 9 || error.message?.includes('index')) {
            devLog.warn('Query index missing, falling back to basic query', undefined, 'community');
            // Fallback: query without orderBy
            contributionsSnapshot = await db.collection('communityContributions')
              .where('userId', '==', userId)
              .get();
            
            // Sort in memory by createdAt descending
            contributionsSnapshot.docs.sort((a: any, b: any) => {
              const aDate = a.data().createdAt?.toDate?.()?.getTime() || a.data().createdAt || 0;
              const bDate = b.data().createdAt?.toDate?.()?.getTime() || b.data().createdAt || 0;
              return bDate - aDate;
            });
          } else {
            throw error;
          }
        }

        contributions = contributionsSnapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type || 'suggestion',
            title: data.title || '',
            description: data.description || '',
            status: data.status || 'under-review',
            impact: data.impact || 'medium',
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            comments: data.comments || 0,
            date: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            implementedDate: data.implementedDate?.toDate?.()?.toISOString() || data.implementedDate || null,
          };
        });

        // Calculate impact score
        impactScore = contributions.reduce((total, contribution) => {
          let contributionScore = contribution.upvotes * getImpactWeight(contribution.impact);
          
          // Bonus for implemented contributions
          if (contribution.status === 'implemented') {
            contributionScore += 50;
          }
          
          return total + contributionScore;
        }, 0);

        implementedCount = contributions.filter(c => c.status === 'implemented').length;
      } catch (error) {
        devLog.error('Error fetching contributions:', error, 'community');
      }

      // Fetch referral statistics
      let referralStats = {
        totalInvites: 0,
        successfulSignups: 0,
        pendingInvites: 0,
        lastInviteDate: null as string | null,
      };

      try {
        // Check for referrals in referrals collection
        let referralsSnapshot;
        try {
          referralsSnapshot = await db.collection('referrals')
            .where('referrerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        } catch (error) {
          // Check user profile for referral tracking
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const referredUsersSnapshot = await db.collection('users')
              .where('referredBy', '==', userId)
              .get();
            referralsSnapshot = referredUsersSnapshot;
          } else {
            referralsSnapshot = { docs: [], empty: true, size: 0 };
          }
        }

        if (!referralsSnapshot.empty && referralsSnapshot.docs) {
          referralStats.totalInvites = referralsSnapshot.docs.length;
          
          for (const doc of referralsSnapshot.docs) {
            const data = doc.data();
            
            if (data.uid || data.email) {
              // User document - successful signup
              referralStats.successfulSignups++;
              const createdAt = data.createdAt || data.creationTime || data.createdAt;
              if (createdAt) {
                const inviteDate = createdAt.toDate?.()?.toISOString() || new Date(createdAt).toISOString();
                if (!referralStats.lastInviteDate || inviteDate > referralStats.lastInviteDate) {
                  referralStats.lastInviteDate = inviteDate;
                }
              }
            } else if (data.status) {
              if (data.status === 'completed' || data.status === 'signed-up') {
                referralStats.successfulSignups++;
              } else if (data.status === 'pending') {
                referralStats.pendingInvites++;
              }
              
              const createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt;
              if (createdAt && (!referralStats.lastInviteDate || createdAt > referralStats.lastInviteDate)) {
                referralStats.lastInviteDate = createdAt;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }

      // Generate thank you messages based on activity
      const thankYouMessages: string[] = [];
      if (implementedCount > 0) {
        thankYouMessages.push("Thank you for helping make FutureSeer better! ✨");
      }
      if (impactScore > 100) {
        thankYouMessages.push("Your feedback directly improved the user experience 🌟");
      }
      if (referralStats.successfulSignups > 0 || contributions.length > 0) {
        thankYouMessages.push("You're part of our mystical community's growth 🔮");
      }
      
      // Default messages if no activity yet
      if (thankYouMessages.length === 0) {
        thankYouMessages.push(
          "Welcome to the FutureSeer community! 🌟",
          "Your contributions make a difference ✨",
          "Together we build the future of mystical insights 🔮"
        );
      }

      return NextResponse.json({
        success: true,
        attribution: {
          contributions,
          referralStats,
          totalImpact: impactScore,
          implementedSuggestions: implementedCount,
          thankYouMessages,
        },
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error fetching user attribution:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user attribution' }, { status: 500 });
  }
}

// Helper function to get impact weight for calculating impact score
function getImpactWeight(impact: 'high' | 'medium' | 'low'): number {
  switch (impact) {
    case 'high': return 10;
    case 'medium': return 5;
    case 'low': return 2;
    default: return 5;
  }
}

