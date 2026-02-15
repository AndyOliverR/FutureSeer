import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { getLevelFromKarma, getReputation, calculateBadges } from '@/lib/firestore/communityHelpers';

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ userId: '_' }]
}

// GET - Fetch single member profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { userId } = await params;

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const memberRef = db.collection('communityMembers').doc(userId);
      const memberDoc = await memberRef.get();

      if (!memberDoc.exists) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      const data = memberDoc.data();
      const karma = data!.karma || 0;
      const contributions = data!.contributions || 0;
      const streak = data!.streak || 0;
      const joinDate = data!.joinDate?.toDate?.() || new Date(data!.joinDate || Date.now());

      // Get discussion and comment counts
      const discussionsSnapshot = await db.collection('communityDiscussions')
        .where('authorId', '==', userId)
        .get();
      
      // Get comment count (need to check all discussions)
      // This is inefficient but necessary until we store userId in comments
      let commentCount = 0;
      const discussions = await db.collection('communityDiscussions').limit(100).get();
      for (const discussionDoc of discussions.docs) {
        const commentsSnapshot = await discussionDoc.ref
          .collection('comments')
          .where('authorId', '==', userId)
          .get();
        commentCount += commentsSnapshot.size;
      }

      // Calculate upvotes received (simplified - count votes on user's discussions and comments)
      let upvotesReceived = 0;
      for (const discussionDoc of discussionsSnapshot.docs) {
        const discussionData = discussionDoc.data();
        upvotesReceived += discussionData.upvotes || 0;
      }

      // Recalculate badges
      const badges = calculateBadges(
        karma,
        contributions,
        joinDate.toISOString(),
        commentCount,
        discussionsSnapshot.size,
        upvotesReceived
      );

      // Update badges if they've changed
      if (JSON.stringify(badges) !== JSON.stringify(data!.badges || [])) {
        await memberRef.update({ badges });
      }

      const member = {
        id: memberDoc.id,
        userId: data!.userId || memberDoc.id,
        name: data!.name || 'Anonymous',
        karma,
        level: getLevelFromKarma(karma),
        contributions,
        streak,
        joinDate: joinDate.toISOString(),
        lastActive: data!.lastActive?.toDate?.()?.toISOString() || data!.lastActive || new Date().toISOString(),
        interests: data!.interests || [],
        badges,
        reputation: getReputation(karma, contributions, streak),
        flair: data!.flair || '',
        isOnline: false, // TODO: Implement real-time online status
        discussionCount: discussionsSnapshot.size,
        commentCount,
      };

      return NextResponse.json({
        success: true,
        member,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error fetching member:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to fetch member' }, { status: 500 });
  }
}

