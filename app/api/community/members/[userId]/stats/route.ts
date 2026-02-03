import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';

// GET - Fetch detailed member stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

      const memberData = memberDoc.data();

      // Get user's discussions
      const discussionsSnapshot = await db.collection('communityDiscussions')
        .where('authorId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const discussions = discussionsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        category: doc.data().category,
        upvotes: doc.data().upvotes || 0,
        downvotes: doc.data().downvotes || 0,
        commentCount: doc.data().commentCount || 0,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      }));

      // Get comment count (simplified - check recent discussions)
      let commentCount = 0;
      let totalCommentUpvotes = 0;
      const recentDiscussions = await db.collection('communityDiscussions').limit(100).get();
      
      for (const discussionDoc of recentDiscussions.docs) {
        const commentsSnapshot = await discussionDoc.ref
          .collection('comments')
          .where('authorId', '==', userId)
          .get();
        commentCount += commentsSnapshot.size;
        commentsSnapshot.docs.forEach(commentDoc => {
          totalCommentUpvotes += commentDoc.data().upvotes || 0;
        });
      }

      // Calculate total upvotes received
      const totalUpvotesReceived = discussions.reduce((sum, d) => sum + d.upvotes, 0) + totalCommentUpvotes;

      // Get recent activity
      const recentActivity: any[] = [];
      
      // Recent discussions
      discussions.slice(0, 10).forEach(discussion => {
        recentActivity.push({
          type: 'discussion',
          id: discussion.id,
          title: discussion.title,
          date: discussion.createdAt,
        });
      });

      // Recent comments (simplified - check recent discussions)
      for (const discussionDoc of recentDiscussions.docs.slice(0, 20)) {
        const commentsSnapshot = await discussionDoc.ref
          .collection('comments')
          .where('authorId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(5)
          .get();
        
        commentsSnapshot.docs.forEach(commentDoc => {
          recentActivity.push({
            type: 'comment',
            id: commentDoc.id,
            discussionId: discussionDoc.id,
            discussionTitle: discussionDoc.data().title,
            date: commentDoc.data().createdAt?.toDate?.()?.toISOString() || commentDoc.data().createdAt,
          });
        });
      }

      // Sort by date
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      recentActivity.splice(20); // Keep top 20

      const stats = {
        totalDiscussions: discussions.length,
        totalComments: commentCount,
        totalUpvotesReceived,
        totalKarma: memberData!.karma || 0,
        currentStreak: memberData!.streak || 0,
        contributions: memberData!.contributions || 0,
        level: memberData!.level || 'Novice',
        reputation: memberData!.reputation || 'Respected',
        badges: memberData!.badges || [],
        recentActivity,
      };

      return NextResponse.json({
        success: true,
        stats,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error fetching member stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch member stats' }, { status: 500 });
  }
}

