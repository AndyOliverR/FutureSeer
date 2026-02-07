import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ id: '_' }]
}

// PATCH - Update comment (author only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { id: commentId } = await params;
    const body = await request.json();
    const { content, discussionId, userId } = body;

    if (!discussionId) {
      return NextResponse.json({ error: 'Discussion ID is required' }, { status: 400 });
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const discussionRef = db.collection('communityDiscussions').doc(discussionId);
      const commentRef = discussionRef.collection('comments').doc(commentId);
      const commentDoc = await commentRef.get();

      if (!commentDoc.exists) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      const commentData = commentDoc.data();

      // Check if user is the author
      if (commentData?.authorId !== userId) {
        return NextResponse.json({ error: 'Unauthorized: Only author can update' }, { status: 403 });
      }

      await commentRef.update({
        content,
        updatedAt: new Date(),
      });

      const updatedDoc = await commentRef.get();

      return NextResponse.json({
        success: true,
        comment: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
          createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString() || updatedDoc.data()?.createdAt,
          updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString() || updatedDoc.data()?.updatedAt,
        },
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: error.message || 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE - Delete comment (author or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { id: commentId } = await params;
    const { searchParams } = new URL(request.url);
    const discussionId = searchParams.get('discussionId');
    const userId = searchParams.get('userId');

    if (!discussionId || !userId) {
      return NextResponse.json({ error: 'Discussion ID and User ID are required' }, { status: 400 });
    }

    const db = getFirebaseDB();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK
      const discussionRef = db.collection('communityDiscussions').doc(discussionId);
      const commentRef = discussionRef.collection('comments').doc(commentId);
      const commentDoc = await commentRef.get();

      if (!commentDoc.exists) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      const commentData = commentDoc.data();

      // Check if user is the author (TODO: add admin check)
      if (commentData?.authorId !== userId) {
        return NextResponse.json({ error: 'Unauthorized: Only author can delete' }, { status: 403 });
      }

      // Delete comment
      await commentRef.delete();

      // Update discussion comment count
      const discussionDoc = await discussionRef.get();
      if (discussionDoc.exists) {
        await discussionRef.update({
          commentCount: Math.max(0, (discussionDoc.data()?.commentCount || 0) - 1),
          lastActivityAt: new Date(),
        });
      }

      // Update community stats
      await updateCommunityStats(db, { comments: -1 });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 500 });
  }
}

// Helper function to update community stats
async function updateCommunityStats(db: any, updates: { comments?: number }) {
  try {
    const statsRef = db.collection('communityStats').doc('main');
    const statsDoc = await statsRef.get();

    if (statsDoc.exists) {
      const statsData = statsDoc.data();
      await statsRef.update({
        totalComments: Math.max(0, statsData.totalComments + (updates.comments || 0)),
        lastUpdated: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating community stats:', error);
  }
}

