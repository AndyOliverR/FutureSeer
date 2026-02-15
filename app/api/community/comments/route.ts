import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase';
import { calculateKarmaForAction, calculateMemberStatsUpdate } from '@/lib/firestore/communityHelpers';

interface CommentData {
  discussionId: string;
  content: string;
  parentCommentId?: string;
  userId: string;
  authorName: string;
}

// POST - Create comment on discussion
export async function POST(request: NextRequest) {
  try {
    const body: CommentData = await request.json();
    const { discussionId, content, parentCommentId, userId, authorName } = body;

    if (!discussionId || !content || !userId || !authorName) {
      return NextResponse.json(
        { error: 'Missing required fields: discussionId, content, userId, authorName' },
        { status: 400 }
      );
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const discussionRef = db.collection('communityDiscussions').doc(discussionId);
      const discussionDoc = await discussionRef.get();

      if (!discussionDoc.exists) {
        return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
      }

      // If parent comment specified, verify it exists
      if (parentCommentId) {
        const parentCommentDoc = await discussionRef.collection('comments').doc(parentCommentId).get();
        if (!parentCommentDoc.exists) {
          return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
        }
      }

      const now = new Date();

      // Create comment
      const commentRef = discussionRef.collection('comments').doc();
      const commentData = {
        content,
        authorId: userId,
        authorName,
        discussionId, // Store for easy reference
        parentCommentId: parentCommentId || null,
        upvotes: 0,
        downvotes: 0,
        createdAt: now,
        updatedAt: now,
      };

      await commentRef.set(commentData);

      // Update discussion comment count and last activity
      await discussionRef.update({
        commentCount: (discussionDoc.data()?.commentCount || 0) + 1,
        lastActivityAt: now,
        updatedAt: now,
      });

      // Update member stats
      await updateMemberStats(db, userId, 'createComment');

      // Ensure member profile exists
      await ensureMemberProfile(db, userId, authorName);

      // Update community stats
      await updateCommunityStats(db, { comments: 1 });

      return NextResponse.json({
        success: true,
        comment: {
          id: commentRef.id,
          ...commentData,
          createdAt: commentData.createdAt.toISOString(),
          updatedAt: commentData.updatedAt.toISOString(),
        },
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    devLog.error('Error creating comment:', error, 'route');
    return NextResponse.json({ error: error.message || 'Failed to create comment' }, { status: 500 });
  }
}

// Helper function to update member stats
async function updateMemberStats(db: any, userId: string, action: 'createDiscussion' | 'createComment' | 'receiveUpvote' | 'receiveDownvote') {
  try {
    const memberRef = db.collection('communityMembers').doc(userId);
    const memberDoc = await memberRef.get();

    if (memberDoc.exists) {
      const memberData = memberDoc.data();
      const statsUpdate = calculateMemberStatsUpdate(
        {
          karma: memberData.karma || 0,
          contributions: memberData.contributions || 0,
          lastActive: memberData.lastActive || new Date(),
          streak: memberData.streak || 0,
        },
        action,
        memberData.lastActive
      );

      const karmaChange = calculateKarmaForAction(action);
      const newKarma = Math.max(0, (memberData.karma || 0) + karmaChange);
      const newContributions = (action === 'createDiscussion' || action === 'createComment')
        ? (memberData.contributions || 0) + 1
        : (memberData.contributions || 0);

      await memberRef.update({
        karma: newKarma,
        contributions: newContributions,
        lastActive: new Date(),
        streak: statsUpdate.streak,
      });
    } else {
      // Create new member profile
      const karmaChange = calculateKarmaForAction(action);
      await memberRef.set({
        userId,
        karma: Math.max(0, karmaChange),
        contributions: (action === 'createDiscussion' || action === 'createComment') ? 1 : 0,
        lastActive: new Date(),
        streak: 1,
        joinDate: new Date(),
        badges: [],
        reputation: 'Respected',
        interests: [],
        flair: '',
      });
    }
  } catch (error) {
    devLog.error('Error updating member stats:', error, 'route');
  }
}

// Helper function to ensure member profile exists
async function ensureMemberProfile(db: any, userId: string, authorName: string) {
  try {
    const memberRef = db.collection('communityMembers').doc(userId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      await memberRef.set({
        userId,
        name: authorName,
        karma: 0,
        contributions: 0,
        lastActive: new Date(),
        streak: 0,
        joinDate: new Date(),
        badges: [],
        reputation: 'Respected',
        interests: [],
        flair: '',
      });
    } else {
      const memberData = memberDoc.data();
      if (authorName && memberData.name !== authorName) {
        await memberRef.update({ name: authorName });
      }
    }
  } catch (error) {
    devLog.error('Error ensuring member profile:', error, 'route');
  }
}

// Helper function to update community stats
async function updateCommunityStats(db: any, updates: { comments?: number }) {
  try {
    const statsRef = db.collection('communityStats').doc('main');
    const statsDoc = await statsRef.get();

    const now = new Date();
    if (statsDoc.exists) {
      const statsData = statsDoc.data();
      await statsRef.update({
        totalComments: statsData.totalComments + (updates.comments || 0),
        lastUpdated: now,
      });
    } else {
      await statsRef.set({
        totalMembers: 0,
        totalDiscussions: 0,
        totalComments: updates.comments || 0,
        activeToday: 0,
        activeThisWeek: 0,
        lastUpdated: now,
      });
    }
  } catch (error) {
    devLog.error('Error updating community stats:', error, 'route');
  }
}

