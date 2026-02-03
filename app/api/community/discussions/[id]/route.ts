import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDB } from '@/lib/firebase';
import { isHotDiscussion } from '@/lib/firestore/communityHelpers';

// GET - Fetch single discussion with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: discussionId } = await params;

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

      const discussionData = discussionDoc.data();

      // Fetch comments
      const commentsSnapshot = await discussionRef
        .collection('comments')
        .orderBy('createdAt', 'asc')
        .get();

      const comments = commentsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      }));

      return NextResponse.json({
        success: true,
        discussion: {
          id: discussionDoc.id,
          ...discussionData,
          createdAt: discussionData?.createdAt?.toDate?.()?.toISOString() || discussionData?.createdAt,
          updatedAt: discussionData?.updatedAt?.toDate?.()?.toISOString() || discussionData?.updatedAt,
          lastActivityAt: discussionData?.lastActivityAt?.toDate?.()?.toISOString() || discussionData?.lastActivityAt,
        },
        comments,
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error fetching discussion:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch discussion' }, { status: 500 });
  }
}

// PATCH - Update discussion (author only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: discussionId } = await params;
    const body = await request.json();
    const { title, content, category, priority, userId } = body;

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

      const discussionData = discussionDoc.data();

      // Check if user is the author
      if (discussionData?.authorId !== userId) {
        return NextResponse.json({ error: 'Unauthorized: Only author can update' }, { status: 403 });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (category !== undefined) updateData.category = category;
      if (priority !== undefined) updateData.priority = priority;

      // Check if hot status should be updated
      if (updateData.content || updateData.title) {
        const isHot = isHotDiscussion(
          discussionData.createdAt?.toDate?.() || new Date(discussionData.createdAt),
          new Date(),
          discussionData.commentCount || 0,
          discussionData.upvotes || 0,
          discussionData.downvotes || 0
        );
        updateData.isHot = isHot;
      }

      await discussionRef.update(updateData);

      const updatedDoc = await discussionRef.get();

      return NextResponse.json({
        success: true,
        discussion: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
          createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString() || updatedDoc.data()?.createdAt,
          updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString() || updatedDoc.data()?.updatedAt,
          lastActivityAt: updatedDoc.data()?.lastActivityAt?.toDate?.()?.toISOString() || updatedDoc.data()?.lastActivityAt,
        },
      });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating discussion:', error);
    return NextResponse.json({ error: error.message || 'Failed to update discussion' }, { status: 500 });
  }
}

// DELETE - Delete discussion (author or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: discussionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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

      const discussionData = discussionDoc.data();

      // Check if user is the author (TODO: add admin check)
      if (discussionData?.authorId !== userId) {
        return NextResponse.json({ error: 'Unauthorized: Only author can delete' }, { status: 403 });
      }

      // Delete all comments first
      const commentsSnapshot = await discussionRef.collection('comments').get();
      const batch = db.batch();
      
      commentsSnapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
      });

      // Delete discussion
      batch.delete(discussionRef);

      await batch.commit();

      // Update community stats
      await updateCommunityStats(db, { 
        discussions: -1,
        comments: -commentsSnapshot.docs.length 
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Client-side not supported for this endpoint' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error deleting discussion:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete discussion' }, { status: 500 });
  }
}

// Helper function to update community stats
async function updateCommunityStats(db: any, updates: { discussions?: number; comments?: number }) {
  try {
    const statsRef = db.collection('communityStats').doc('main');
    const statsDoc = await statsRef.get();

    if (statsDoc.exists) {
      const statsData = statsDoc.data();
      await statsRef.update({
        totalDiscussions: Math.max(0, statsData.totalDiscussions + (updates.discussions || 0)),
        totalComments: Math.max(0, statsData.totalComments + (updates.comments || 0)),
        lastUpdated: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating community stats:', error);
  }
}

