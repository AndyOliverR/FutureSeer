import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { calculateKarmaForAction } from '@/lib/firestore/communityHelpers';

interface VoteData {
  userId: string;
  discussionId?: string;
  commentId?: string;
  voteType: 'up' | 'down';
}

// POST - Vote on discussion or comment
export async function POST(request: NextRequest) {
  try {
    const body: VoteData = await request.json();
    const { userId, discussionId, commentId, voteType } = body;

    if (!userId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, voteType' },
        { status: 400 }
      );
    }

    if (!discussionId && !commentId) {
      return NextResponse.json(
        { error: 'Either discussionId or commentId must be provided' },
        { status: 400 }
      );
    }

    if (discussionId && commentId) {
      return NextResponse.json(
        { error: 'Cannot vote on both discussion and comment simultaneously' },
        { status: 400 }
      );
    }

    if (voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json(
        { error: 'Invalid voteType. Must be "up" or "down"' },
        { status: 400 }
      );
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const targetId = discussionId || commentId!;
      const isDiscussion = !!discussionId;

      // Check if user has already voted
      const voteQuery = db.collection('communityVotes')
        .where('userId', '==', userId)
        .where(isDiscussion ? 'discussionId' : 'commentId', '==', targetId);

      const existingVotes = await voteQuery.get();

      let existingVote: any = null;
      let existingVoteId: string | null = null;

      if (!existingVotes.empty) {
        existingVote = existingVotes.docs[0].data();
        existingVoteId = existingVotes.docs[0].id;
      }

      // If user already voted the same way, remove the vote
      if (existingVote && existingVote.voteType === voteType) {
        // Remove vote
        await db.collection('communityVotes').doc(existingVoteId!).delete();

        // Update vote counts (decrement)
        const updateField = isDiscussion ? 'discussions' : 'comments';
        await updateVoteCounts(db, isDiscussion, targetId, voteType === 'up' ? -1 : 0, voteType === 'down' ? -1 : 0);

        // Update karma for original author (undo previous karma change)
        if (isDiscussion) {
          const discussionDoc = await db.collection('communityDiscussions').doc(targetId).get();
          if (discussionDoc.exists) {
            const discussionData = discussionDoc.data();
            await updateAuthorKarma(db, discussionData!.authorId, voteType === 'up' ? -1 : 1);
          }
        } else {
          // Find discussion by checking comment's discussionId field
          const discussionsSnapshot = await db.collection('communityDiscussions').limit(100).get();
          for (const discussionDoc of discussionsSnapshot.docs) {
            const commentDoc = await discussionDoc.ref.collection('comments').doc(targetId).get();
            if (commentDoc.exists) {
              const commentData = commentDoc.data();
              await updateAuthorKarma(db, commentData!.authorId, voteType === 'up' ? -1 : 1);
              // Update comment vote counts
              await commentDoc.ref.update({
                upvotes: Math.max(0, (commentData!.upvotes || 0) + (voteType === 'up' ? -1 : 0)),
                downvotes: Math.max(0, (commentData!.downvotes || 0) + (voteType === 'down' ? -1 : 0)),
              });
              break;
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Vote removed',
          voted: false,
        });
      }

      // If user voted differently, update the vote
      if (existingVote && existingVote.voteType !== voteType) {
        // Update existing vote
        await db.collection('communityVotes').doc(existingVoteId!).update({
          voteType,
          createdAt: new Date(),
        });

        // Update vote counts (switch from old to new)
        const oldVoteType = existingVote.voteType;
        await updateVoteCounts(
          db,
          isDiscussion,
          targetId,
          oldVoteType === 'up' ? -1 : (voteType === 'up' ? 1 : 0),
          oldVoteType === 'down' ? -1 : (voteType === 'down' ? 1 : 0)
        );

        // Update karma for original author (switch karma)
        if (isDiscussion) {
          const discussionDoc = await db.collection('communityDiscussions').doc(targetId).get();
          if (discussionDoc.exists) {
            const discussionData = discussionDoc.data();
            await updateAuthorKarma(db, discussionData!.authorId, oldVoteType === 'up' ? -1 : 1, voteType === 'up' ? 1 : -1);
          }
        } else {
          // Find discussion by checking comment's discussionId field
          const discussionsSnapshot = await db.collection('communityDiscussions').limit(100).get();
          for (const discussionDoc of discussionsSnapshot.docs) {
            const commentDoc = await discussionDoc.ref.collection('comments').doc(targetId).get();
            if (commentDoc.exists) {
              const commentData = commentDoc.data();
              await updateAuthorKarma(db, commentData!.authorId, oldVoteType === 'up' ? -1 : 1, voteType === 'up' ? 1 : -1);
              // Update comment vote counts
              await commentDoc.ref.update({
                upvotes: Math.max(0, (commentData!.upvotes || 0) + (oldVoteType === 'up' ? -1 : (voteType === 'up' ? 1 : 0))),
                downvotes: Math.max(0, (commentData!.downvotes || 0) + (oldVoteType === 'down' ? -1 : (voteType === 'down' ? 1 : 0))),
              });
              break;
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Vote updated',
          voted: true,
          voteType,
        });
      }

      // Create new vote
      const voteRef = db.collection('communityVotes').doc();
      await voteRef.set({
        userId,
        [isDiscussion ? 'discussionId' : 'commentId']: targetId,
        voteType,
        createdAt: new Date(),
      });

      // Update vote counts
      await updateVoteCounts(
        db,
        isDiscussion,
        targetId,
        voteType === 'up' ? 1 : 0,
        voteType === 'down' ? 1 : 0
      );

        // Update karma for original author
        if (isDiscussion) {
          const discussionDoc = await db.collection('communityDiscussions').doc(targetId).get();
          if (discussionDoc.exists) {
            const discussionData = discussionDoc.data();
            // Only update karma if voting on someone else's discussion
            if (discussionData!.authorId !== userId) {
              await updateAuthorKarma(db, discussionData!.authorId, voteType === 'up' ? 1 : -1);
            }
          }
        } else {
          // Find discussion by checking comment's discussionId field
          const discussionsSnapshot = await db.collection('communityDiscussions').limit(100).get();
          for (const discussionDoc of discussionsSnapshot.docs) {
            const commentDoc = await discussionDoc.ref.collection('comments').doc(targetId).get();
            if (commentDoc.exists) {
              const commentData = commentDoc.data();
              // Only update karma if voting on someone else's comment
              if (commentData!.authorId !== userId) {
                await updateAuthorKarma(db, commentData!.authorId, voteType === 'up' ? 1 : -1);
              }
              // Update comment vote counts
              await commentDoc.ref.update({
                upvotes: Math.max(0, (commentData!.upvotes || 0) + (voteType === 'up' ? 1 : 0)),
                downvotes: Math.max(0, (commentData!.downvotes || 0) + (voteType === 'down' ? 1 : 0)),
              });
              break;
            }
          }
        }

      return NextResponse.json({
        success: true,
        message: 'Vote recorded',
        voted: true,
        voteType,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: error.message || 'Failed to record vote' }, { status: 500 });
  }
}

// Helper function to update vote counts on discussion or comment
async function updateVoteCounts(
  db: any,
  isDiscussion: boolean,
  targetId: string,
  upvoteDelta: number,
  downvoteDelta: number
) {
  try {
    if (isDiscussion) {
      const discussionRef = db.collection('communityDiscussions').doc(targetId);
      const discussionDoc = await discussionRef.get();

      if (discussionDoc.exists) {
        const data = discussionDoc.data();
        await discussionRef.update({
          upvotes: Math.max(0, (data.upvotes || 0) + upvoteDelta),
          downvotes: Math.max(0, (data.downvotes || 0) + downvoteDelta),
          lastActivityAt: new Date(),
        });
      }
    } else {
      // Find comment by checking all discussions (comment has discussionId stored)
      const discussionsSnapshot = await db.collection('communityDiscussions').limit(100).get();
      for (const discussionDoc of discussionsSnapshot.docs) {
        const commentDoc = await discussionDoc.ref.collection('comments').doc(targetId).get();
        if (commentDoc.exists) {
          const data = commentDoc.data();
          await commentDoc.ref.update({
            upvotes: Math.max(0, (data!.upvotes || 0) + upvoteDelta),
            downvotes: Math.max(0, (data!.downvotes || 0) + downvoteDelta),
          });
          break;
        }
      }
    }
  } catch (error) {
    console.error('Error updating vote counts:', error);
  }
}

// Helper function to update author karma
async function updateAuthorKarma(db: any, authorId: string, karmaDelta: number, additionalDelta: number = 0) {
  try {
    const memberRef = db.collection('communityMembers').doc(authorId);
    const memberDoc = await memberRef.get();

    if (memberDoc.exists) {
      const memberData = memberDoc.data();
      const newKarma = Math.max(0, (memberData.karma || 0) + karmaDelta + additionalDelta);
      
      await memberRef.update({
        karma: newKarma,
      });
    }
  } catch (error) {
    console.error('Error updating author karma:', error);
  }
}

// GET - Check if user has voted on a discussion or comment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const discussionId = searchParams.get('discussionId');
    const commentId = searchParams.get('commentId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!discussionId && !commentId) {
      return NextResponse.json(
        { error: 'Either discussionId or commentId must be provided' },
        { status: 400 }
      );
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const targetId = discussionId || commentId!;
      const isDiscussion = !!discussionId;

      const voteQuery = db.collection('communityVotes')
        .where('userId', '==', userId)
        .where(isDiscussion ? 'discussionId' : 'commentId', '==', targetId);

      const existingVotes = await voteQuery.get();

      if (existingVotes.empty) {
        return NextResponse.json({
          success: true,
          hasVoted: false,
        });
      }

      const voteData = existingVotes.docs[0].data();

      return NextResponse.json({
        success: true,
        hasVoted: true,
        voteType: voteData.voteType,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error checking vote:', error);
    return NextResponse.json({ error: error.message || 'Failed to check vote' }, { status: 500 });
  }
}

